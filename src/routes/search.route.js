const searchSchema = {
    querystring: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        type: { type: 'string', enum: ['notes', 'pyqs', 'assignments'] },
        subject: { type: 'string' },
        semester: { type: 'number' },
        year: { type: 'string' }
      },
      required: ['query']
    }
  };
  
  export const searchRoutes = async (fastify) => {
    fastify.get(
      "/",
      {
        preHandler: [fastify.authenticate],
        schema: searchSchema
      },
      searchResources
    );
  };
  
  export const analyticsRoutes = async (fastify) => {
    // Middleware to verify faculty
    const verifyFaculty = async (request, reply) => {
      if (request.user.role !== 'faculty') {
        reply.code(403).send({
          success: false,
          message: "Faculty access required"
        });
      }
    };
  
    fastify.get(
      "/subject/:subjectId",
      {
        preHandler: [fastify.authenticate, verifyFaculty],
        schema: {
          params: {
            type: 'object',
            properties: {
              subjectId: { type: 'string' }
            },
            required: ['subjectId']
          },
          querystring: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' }
            }
          }
        }
      },
      getSubjectAnalytics
    );
  };