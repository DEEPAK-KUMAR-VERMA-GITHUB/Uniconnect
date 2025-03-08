import rateLimit from '@fastify/rate-limit';

fastify.register(rateLimit, {
  max: 10,
  timeWindow: '1 minute',
  route: '/create'
});

export const searchResources = async (request, reply) => {
  try {
    const { query, type, subject, semester, year } = request.query;
    const user = request.user;

    // Base search conditions
    const searchConditions = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    // Add filters
    if (subject) searchConditions.subject = subject;
    if (semester) searchConditions.semester = semester;
    if (year) searchConditions.year = year;

    // Get user's subjects
    const userSubjects = await Subject.find(
      user.role === 'faculty' 
        ? { subjectFaculty: user._id }
        : { course: user.course, semester: user.semester }
    ).select('_id');

    searchConditions.subject = { $in: userSubjects };

    let results = {};

    // Search based on type
    switch(type) {
      case 'notes':
        results.notes = await Note.find(searchConditions)
          .populate('subject', 'subjectName subjectCode')
          .populate('uploadedBy', 'name')
          .sort({ createdAt: -1 });
        break;

      case 'pyqs':
        results.pyqs = await PYQ.find(searchConditions)
          .populate('subject', 'subjectName subjectCode')
          .populate('uploadedBy', 'name')
          .sort({ year: -1 });
        break;

      case 'assignments':
        results.assignments = await Assignment.find(searchConditions)
          .populate('subject', 'subjectName subjectCode')
          .populate('uploadedBy', 'name')
          .sort({ dueDate: -1 });
        break;

      default:
        // Search all types if no specific type is specified
        const [notes, pyqs, assignments] = await Promise.all([
          Note.find(searchConditions)
            .populate('subject', 'subjectName subjectCode')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 }),
          PYQ.find(searchConditions)
            .populate('subject', 'subjectName subjectCode')
            .populate('uploadedBy', 'name')
            .sort({ year: -1 }),
          Assignment.find(searchConditions)
            .populate('subject', 'subjectName subjectCode')
            .populate('uploadedBy', 'name')
            .sort({ dueDate: -1 })
        ]);

        results = { notes, pyqs, assignments };
    }

    return reply.code(200).send({
      success: true,
      results
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};