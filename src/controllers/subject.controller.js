import { Resource } from "../models/resource.model.js";
import { Subject } from "../models/subject.model.js";
import { Faculty } from "../models/user.model.js";
import { AssignmentSubmission } from "./../models/assignmentSubmission.model.js";
import { createNotification } from "./notification.controller.js";

export const createSubject = async (req, res) => {
  try {
    const { subjectName, subjectCode, subjectFaculty, subjectCourse } =
      req.body;

    if (!subjectName || !subjectCode || !subjectFaculty || !subjectCourse) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isSubjectExists = await Subject.findOne({ subjectCode });
    if (isSubjectExists) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = new Subject({
      subjectName,
      subjectCode,
      subjectFaculty,
      subjectCourse,
    });

    // notify faculty about the new subject
    const faculty = await Faculty.findById(subjectFaculty);
    faculty.subjects.push(subject._id);

    await faculty.save();

    await createNotification({
      recipient: subjectFaculty,
      recipientModel: "Faculty",
      title: "New Subject Assigned",
      message: `You have assigned with a new subject: ${subjectName}`,
      type: "NOTICE",
      relatedId: subject._id,
    });

    await subject.save();
    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    return res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    return res.status(200).json(subject);
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    const { subjectName, subjectCode, subjectFaculty, subjectCourse } =
      req.body;

    if (subjectName) subject.subjectName = subjectName;
    if (subjectCode) subject.subjectCode = subjectCode;
    if (subjectFaculty) subject.subjectFaculty = subjectFaculty;
    if (subjectCourse) subject.subjectCourse = subjectCourse;

    await subject.save();
    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    // Get all resources and submissions for this subject
    const resources = await Resource.find({ subject: subject._id });
    const submissions = await AssignmentSubmission.find({
      assignment: { $in: resources.map((r) => r._id) },
    });

    // Delete files from cloudinary
    for (const resource of resources) {
      const publicId = resource.fileUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    for (const submission of submissions) {
      const publicId = submission.fileUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete records from database
    await Resource.deleteMany({ subject: subject._id });
    await AssignmentSubmission.deleteMany({
      assignment: { $in: resources.map((r) => r._id) },
    });

    await subject.remove();
    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
