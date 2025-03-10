import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(
      `✅ Uniconnect MongoDB Database is Connected: ${conn.connection.host}`
    );

    mongoose.connection.on("error", (err) => {
      console.log("❌ MongoDB connection error : ", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("✂️ MongoDB disconnected");
    });

    return conn;
  } catch (error) {
    console.log(`❌ Error in Uniconnect MongoDB database: ${error.message}`);
    process.exit(1);
  }
};
