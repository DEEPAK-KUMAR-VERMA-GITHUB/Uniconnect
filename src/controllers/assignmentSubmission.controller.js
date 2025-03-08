import { AssignmentSubmission } from "../models/assignmentSubmission.model";
import { Resource } from "../models/resource.model";

export const submitAssignment = async (req, res) => {
  try {
    const { assignment, fileUrl } = req.body;
    if (!assignment || !fileUrl) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const assignmentFile = await Resource.findById(assignment);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // check if date is passed
    const currentDate = new Date();
    if (assignmentFile.dueDate < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Assignment submission date is passed",
      });
    }

    // check if student has already submitted
    const previousSubmission = await Resource.findOne({
      assignment,
      student: req.user._id,
    });
    if (previousSubmission) {
      // if student has already submitted, update the submission
      previousSubmission.fileUrl = fileUrl;
      await previousSubmission.save();
      return res.status(200).json({
        success: true,
        message: "Assignment updated successfully",
        data: previousSubmission,
      });
    }

    const newAssignmentSubmission = new AssignmentSubmission({
      assignment,
      student: req.user._id,
      fileUrl,
      subject: assignmentFile.subject,
    });

    await newAssignmentSubmission.save();

    assignmentFile.submissions.push(newAssignmentSubmission._id);
    await assignmentFile.save();

    return res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: newAssignmentSubmission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// delete assignment submission
export const deleteAssignmentSubmission = async (req, res) => {
  try {
    const assignmentSubmission = await AssignmentSubmission.find({
      _id: req.params.id,
      student: req.user._id,
    });
    if (!assignmentSubmission) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment submission not found" });
    }

    // if date is passed
    const currentDate = new Date();
    const assignment = await Resource.findById(assignmentSubmission.assignment);
    if (assignment.dueDate < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Assignment submission date is passed",
      });
    }

    await assignmentSubmission.remove();
    await Resource.updateOne(
      { _id: assignmentSubmission.assignment },
      { $pull: { submissions: req.params.id } }
    );
    await assignmentSubmission.save();
    await assignmentSubmission.assignment.save();

    return res
      .status(200)
      .json({ success: true, message: "Assignment submission deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
