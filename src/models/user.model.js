import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const UserRoles = Object.freeze({
  STUDENT: "student",
  FACULITY: "faculity",
  ADMIN: "admin",
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 4,
      required: [true, "Name must be atleast 4 characters"],
      trim: true,
      validate: {
        validator: function (value) {
          const nameRegex = /^[a-zA-Z\s]+$/;
          return nameRegex.test(value);
        },
        message: "Name must contain only letters and spaces",
      },
      capitalize: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      validate: {
        validator: function (value) {
          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(value);
        },
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      },
      select: false,
    },
    mobileNumber: {
      type: String,
      validate: {
        validator: function (value) {
          const mobileNumberRegex = /^[0-9]{10}$/;
          return mobileNumberRegex.test(value);
        },
        message: "Invalid mobile number format",
      },
      required: [true, "Mobile number is required"],
    },
    role: {
      type: String,
      enum: Object.values(UserRoles) ,
      required: [true, "Role is required"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    ...userSchema.obj,
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    session: {
      type: String,
      required: [true, "Session is required"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
    },
    role: {
      type: String,
      default: "student",
      enum: ["student"],
    },
  },
  { timestamps: true }
);

const facultySchema = new mongoose.Schema(
  {
    ...userSchema.obj,
    facultyId: {
      type: Number,
      required: [true, "Faculty ID is required"],
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    role: {
      type: String,
      default: "faculty",
      enum: ["faculty"],
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  { timestamps: true }
);

studentSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire =
    Date.now() + process.env.RESET_PASSWORD_EXPIRES * 60 * 1000;

  return resetToken;
};

studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.getSignedJwtToken = function () {
  const accessToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );

  const refreshToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES,
    }
  );

  return { accessToken, refreshToken };
};

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

facultySchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

facultySchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

facultySchema.methods.getSignedJwtToken = function () {
  const accessToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );

  const refreshToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES,
    }
  );

  return { accessToken, refreshToken };
};

facultySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export const Student = mongoose.model("Student", studentSchema);
export const Faculty = mongoose.model("Faculty", facultySchema);
