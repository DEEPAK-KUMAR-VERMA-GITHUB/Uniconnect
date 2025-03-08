import { Resource, resourceTypes } from "../models/resource.model.js";
import { Student } from "../models/user.model.js";
import { createNotification } from "./notification.controller";

export const createResource = async (req, res) => {
  try {
    const { title, fileUrl, subject, semester, course, type } = req.body;
    if (!title || !fileUrl || !subject || !semester || !course || !type) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (
      type !== resourceTypes.NOTES &&
      type !== resourceTypes.PYQ &&
      type !== resourceTypes.ASSIGNMENT
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid resource type" });
    }

    let newResource = null;

    if (type === resourceTypes.PYQ) {
      if (!req.body.year) {
        return res
          .status(400)
          .json({ success: false, message: "Year is required for PYQ" });
      }

      // create new pyq
      newResource = new Resource({
        title,
        type: resourceTypes.PYQ,
        fileUrl,
        subject,
        semester,
        course,
        year: req.body.year,
        uploadedBy: req.user._id,
      });

      // Notify all students in the course and semester about the PYQ upload
      const students = await Student.find({
        course,
        semester,
        subject,
      });

      for (const student of students) {
        await createNotification({
          recipient: student._id,
          recipientModel: "Student",
          title: "New PYQ Available",
          message: `A new PYQ has been uploaded for ${title}`,
          type: "PYQ",
          relatedId: newResource._id,
        });
      }
    } else if (type === resourceTypes.NOTES) {
      newResource = new Resource({
        title,
        type: resourceTypes.NOTES,
        fileUrl,
        subject,
        semester,
        course,
        uploadedBy: req.user._id,
      });

      // Notify all students in the course and semester about the notes upload
      const students = await Student.find({
        course,
        semester,
        subject,
      });

      for (const student of students) {
        await createNotification({
          recipient: student._id,
          recipientModel: "Student",
          title: "New Notes Available",
          message: `New notes have been uploaded for ${title}`,
          type: "NOTES",
          relatedId: newResource._id,
        });
      }
    } else {
      if (!req.body.dueDate) {
        return res.status(400).json({
          success: false,
          message: "Due date is required for assignment",
        });
      }

      newResource = new Resource({
        title,
        type: resourceTypes.ASSIGNMENT,
        fileUrl,
        subject,
        semester,
        course,
        dueDate: req.body.dueDate,
        uploadedBy: req.user._id,
      });

      // Notify all students in the course and semester about the assignment upload
      const students = await Student.find({
        course,
        semester,
        subject,
      });

      for (const student of students) {
        await createNotification({
          recipient: student._id,
          recipientModel: "Student",
          title: "New Assignment",
          message: `New assignment posted for ${
            subject.subjectName
          }: ${title}. Due date: ${new Date(dueDate).toLocaleDateString()}`,
          type: "ASSIGNMENT",
          relatedId: assignment._id,
        });
      }
    }

    await newResource.save();
    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      resource: newResource,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "subject semester course"
    );
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ success: true, resource });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    const { title, fileUrl, subject, semester, course, type } = req.body;
    if (!title || !fileUrl || !subject || !semester || !course || !type) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (
      type !== resourceTypes.NOTES &&
      type !== resourceTypes.PYQ &&
      type !== resourceTypes.ASSIGNMENT
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid resource type" });
    }

    if (type === resourceTypes.PYQ) {
      if (!req.body.year) {
        return res
          .status(400)
          .json({ success: false, message: "Year is required for PYQ" });
      }

      resource.title = title;
      resource.fileUrl = fileUrl;
      resource.subject = subject;
      resource.semester = semester;
      resource.course = course;
      resource.type = resourceTypes.PYQ;
      resource.year = req.body.year;

      // Notify all students in the course and semester about the PYQ upload
      const students = await Student.find({
        course,
        semester,
        subject,
      });

      for (const student of students) {
        await createNotification({
          recipient: student._id,
          recipientModel: "Student",
          title: "New PYQ Available",
          message: `A new PYQ has been uploaded for ${title}`,
          type: "PYQ",
          relatedId: resource._id,
        });
      }
    } else if (type === resourceTypes.NOTES) {
      resource.title = title;
      resource.fileUrl = fileUrl;
      resource.subject = subject;
      resource.semester = semester;
      resource.course = course;
      resource.type = resourceTypes.NOTES;

      // Notify all students in the course and semester about the notes upload
      const students = await Student.find({
        course,
        semester,
        subject,
      });

      for (const student of students) {
        await createNotification({
          recipient: student._id,
          recipientModel: "Student",
          title: "New Notes Available",
          message: `New notes have been uploaded for ${title}`,
          type: "NOTES",
          relatedId: resource._id,
        });
      }
    } else {
      if (!req.body.dueDate) {
        return res.status(400).json({
          success: false,
          message: "Due date is required for assignment",
        });
      }

      resource.title = title;
      resource.fileUrl = fileUrl;
      resource.subject = subject;
      resource.semester = semester;
      resource.course = course;
      resource.type = resourceTypes.ASSIGNMENT;
      resource.dueDate = req.body.dueDate;

      // Notify all students in the course and semester about the assignment upload
      const students = await Student.find({
        course,
        semester,
        subject,
      });

      for (const student of students) {
        await createNotification({
          recipient: student._id,
          recipientModel: "Student",
          title: "New Assignment",
          message: `New assignment posted for ${
            subject.subjectName
          }: ${title}. Due date: ${new Date(dueDate).toLocaleDateString()}`,
          type: "ASSIGNMENT",
          relatedId: resource._id,
        });
      }
    }

    await resource.save();
    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    await resource.remove();

    // notify all students about resource deletion
    const students = await Student.find({
      course: resource.course,
      semester: resource.semester,
      subject: resource.subject,
    });

    for (const student of students) {
      await createNotification({
        recipient: student._id,
        recipientModel: "Student",
        title: "Resource Deleted",
        message: `The resource ${resource.title} has been deleted`,
        type: "NOTICE",
        relatedId: resource._id,
      });
    }

    res.status(200).json({ success: true, message: "Resource deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getResources = async (req, res) => {
  try {
    const { course, semester, subject, type, userId } = req.query;

    // Build filter object based on provided query parameters
    const filter = {};
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;
    if (type) filter.type = type;
    if (userId) filter.uploadedBy = userId;

    const resources = await Resource.find(filter).populate(
      "subject semester course"
    );
    res.status(200).json({ success: true, resources });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
