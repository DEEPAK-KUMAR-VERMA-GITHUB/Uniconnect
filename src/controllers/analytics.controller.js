import { Assignment, Note, PYQ, Student } from '../models/index.js';

export const getSubjectAnalytics = async (request, reply) => {
  try {
    const { subjectId } = request.params;
    const { startDate, endDate } = request.query;
    
    // Verify faculty teaches this subject
    const subject = await Subject.findOne({
      _id: subjectId,
      subjectFaculty: request.user._id
    });

    if (!subject) {
      throw new ErrorHandler("Subject not found or unauthorized", 404);
    }

    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate || new Date().setMonth(new Date().getMonth() - 1)),
        $lte: new Date(endDate || Date.now())
      }
    };

    // Get assignment submission statistics
    const assignments = await Assignment.aggregate([
      { $match: { subject: subject._id, ...dateFilter } },
      {
        $project: {
          title: 1,
          totalSubmissions: { $size: "$submissions" },
          onTimeSubmissions: {
            $size: {
              $filter: {
                input: "$submissions",
                as: "submission",
                cond: { $lte: ["$$submission.submittedAt", "$dueDate"] }
              }
            }
          }
        }
      }
    ]);

    // Get resource upload statistics
    const [notesCount, pyqsCount] = await Promise.all([
      Note.countDocuments({ subject: subject._id, ...dateFilter }),
      PYQ.countDocuments({ subject: subject._id, ...dateFilter })
    ]);

    // Get student engagement metrics
    const studentEngagement = await Student.aggregate([
      {
        $match: {
          course: subject.course,
          semester: subject.semester
        }
      },
      {
        $lookup: {
          from: 'assignments',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$subject', subject._id] },
                    { $in: ['$$studentId', '$submissions.student'] }
                  ]
                }
              }
            }
          ],
          as: 'submittedAssignments'
        }
      },
      {
        $project: {
          name: 1,
          rollNumber: 1,
          submissionRate: {
            $multiply: [
              {
                $divide: [
                  { $size: '$submittedAssignments' },
                  { $max: [1, await Assignment.countDocuments({ subject: subject._id })] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    return reply.code(200).send({
      success: true,
      analytics: {
        assignments: {
          total: assignments.length,
          details: assignments
        },
        resources: {
          notes: notesCount,
          pyqs: pyqsCount
        },
        studentEngagement
      }
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};