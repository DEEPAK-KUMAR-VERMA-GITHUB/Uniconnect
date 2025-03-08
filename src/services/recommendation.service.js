import { Note, PYQ, Assignment, Student } from '../models/index.js';
import mongoose from 'mongoose';

export class RecommendationService {
  static async getPersonalizedRecommendations(student) {
    try {
      // Get student's subject performance and interests
      const studentAssignments = await Assignment.find({
        'submissions.student': student._id
      });

      // Get subjects where student performed well
      const strongSubjects = studentAssignments.reduce((acc, assignment) => {
        const submission = assignment.submissions.find(
          sub => sub.student.toString() === student._id.toString()
        );
        if (submission?.grade >= 8) { // Assuming grade is out of 10
          acc.add(assignment.subject.toString());
        }
        return acc;
      }, new Set());

      // Get recent views/downloads
      const recentActivity = await ResourceActivity.find({
        student: student._id,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).sort({ createdAt: -1 });

      // Calculate resource weights based on student activity
      const resourceWeights = recentActivity.reduce((acc, activity) => {
        acc[activity.resourceType] = (acc[activity.resourceType] || 0) + 1;
        return acc;
      }, {});

      // Get recommendations
      const recommendations = await Promise.all([
        // Similar student recommendations
        this.getSimilarStudentRecommendations(student),
        // Topic-based recommendations
        this.getTopicBasedRecommendations(student, Array.from(strongSubjects)),
        // Popular resources in current semester
        this.getPopularResources(student)
      ]);

      return {
        similarStudents: recommendations[0],
        topicBased: recommendations[1],
        popular: recommendations[2]
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  static async getSimilarStudentRecommendations(student) {
    // Find students in same semester with similar performance
    const similarStudents = await Student.aggregate([
      {
        $match: {
          _id: { $ne: student._id },
          course: student.course,
          semester: student.semester
        }
      },
      {
        $lookup: {
          from: 'resourceactivities',
          localField: '_id',
          foreignField: 'student',
          as: 'activities'
        }
      }
    ]);

    // Get resources viewed by similar students
    const resourceIds = similarStudents
      .flatMap(s => s.activities)
      .map(a => a.resource);

    return await this.getResourcesByIds(resourceIds);
  }

  static async getTopicBasedRecommendations(student, strongSubjects) {
    return await Note.aggregate([
      {
        $match: {
          subject: { $in: strongSubjects.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $lookup: {
          from: 'resourceactivities',
          localField: '_id',
          foreignField: 'resource',
          as: 'activities'
        }
      },
      {
        $addFields: {
          popularity: { $size: '$activities' }
        }
      },
      {
        $sort: { popularity: -1 }
      },
      {
        $limit: 5
      }
    ]);
  }

  static async getPopularResources(student) {
    const currentDate = new Date();
    const semesterStart = new Date(currentDate.getFullYear(), 
      currentDate.getMonth() - 4); // Assuming 4 months per semester

    return await ResourceActivity.aggregate([
      {
        $match: {
          createdAt: { $gte: semesterStart }
        }
      },
      {
        $group: {
          _id: '$resource',
          viewCount: { $sum: 1 }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 5
      }
    ]);
  }

  static async getResourcesByIds(ids) {
    const [notes, pyqs] = await Promise.all([
      Note.find({ _id: { $in: ids } }),
      PYQ.find({ _id: { $in: ids } })
    ]);
    return [...notes, ...pyqs];
  }
}