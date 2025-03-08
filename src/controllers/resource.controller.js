import { Resource, resourceTypes } from "../models/resource.model";

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
    } else if (type === resourceTypes.NOTES) {
      resource.title = title;
      resource.fileUrl = fileUrl;
      resource.subject = subject;
      resource.semester = semester;
      resource.course = course;
      resource.type = resourceTypes.NOTES;
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
