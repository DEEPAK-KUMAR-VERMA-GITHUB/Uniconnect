import { Assignment, Student, Subject } from '../models/index.js';
import { createNotification } from '../controllers/notification.controller.js';
import { sendEmail } from '../utils/emailService.js';
import schedule from 'node-schedule';
import mongoose from 'mongoose';
import { ErrorHandler } from '../utils/ErrorHandler.js';

const resourceActivitySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceType',
    required: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['Note', 'PYQ', 'Assignment']
  },
  activityType: {
    type: String,
    required: true,
    enum: ['VIEW', 'DOWNLOAD']
  }
}, {
  timestamps: true
});

export const ResourceActivity = mongoose.model('ResourceActivity', resourceActivitySchema);

export class ReminderService {
  static async scheduleAssignmentReminders(assignment) {
    try {
      const dueDate = new Date(assignment.dueDate);
      const subject = await Subject.findById(assignment.subject)
        .populate('course');

      // Get all students in the subject's course and semester
      const students = await Student.find({
        course: subject.course._id,
        semester: subject.semester,
        isActive: true
      });

      // Schedule reminders at different intervals
      this.scheduleReminder(assignment, students, dueDate, '7d');
      this.scheduleReminder(assignment, students, dueDate, '3d');
      this.scheduleReminder(assignment, students, dueDate, '1d');
      this.scheduleReminder(assignment, students, dueDate, '6h');

      // Schedule final reminder 1 hour before deadline
      this.scheduleFinalReminder(assignment, students, dueDate);

    } catch (error) {
      console.error('Error scheduling reminders:', error);
      throw error;
    }
  }

  static async scheduleReminder(assignment, students, dueDate, interval) {
    const reminderDate = new Date(dueDate.getTime() - this.getMilliseconds(interval));
    
    if (reminderDate > new Date()) {
      schedule.scheduleJob(reminderDate, async () => {
        try {
          const pendingStudents = await this.getPendingStudents(assignment, students);
          
          for (const student of pendingStudents) {
            // Create in-app notification
            await createNotification({
              recipient: student._id,
              recipientModel: 'Student',
              title: 'Assignment Reminder',
              message: `Assignment "${assignment.title}" is due in ${interval}. Don't forget to submit!`,
              type: 'ASSIGNMENT',
              relatedId: assignment._id
            });

            // Send email notification
            await sendEmail({
              to: student.email,
              subject: `Assignment Due in ${interval}`,
              html: `
                <h2>Assignment Reminder</h2>
                <p>Hello ${student.name},</p>
                <p>This is a reminder that your assignment "${assignment.title}" is due in ${interval}.</p>
                <p>Please ensure to submit it before ${dueDate.toLocaleString()}.</p>
                <p>Assignment Details:</p>
                <ul>
                  <li>Title: ${assignment.title}</li>
                  <li>Subject: ${assignment.subject.subjectName}</li>
                  <li>Due Date: ${dueDate.toLocaleString()}</li>
                </ul>
              `
            });
          }
        } catch (error) {
          console.error('Error sending reminders:', error);
        }
      });
    }
  }

  static async scheduleFinalReminder(assignment, students, dueDate) {
    const finalReminderDate = new Date(dueDate.getTime() - (60 * 60 * 1000)); // 1 hour before

    if (finalReminderDate > new Date()) {
      schedule.scheduleJob(finalReminderDate, async () => {
        try {
          const pendingStudents = await this.getPendingStudents(assignment, students);
          
          for (const student of pendingStudents) {
            // Create urgent in-app notification
            await createNotification({
              recipient: student._id,
              recipientModel: 'Student',
              title: 'URGENT: Assignment Due Soon',
              message: `Assignment "${assignment.title}" is due in 1 hour! Submit now to avoid late penalties.`,
              type: 'ASSIGNMENT',
              relatedId: assignment._id,
              priority: 'HIGH'
            });

            // Send urgent email notification
            await sendEmail({
              to: student.email,
              subject: 'URGENT: Assignment Due in 1 Hour',
              html: `
                <h2 style="color: red;">⚠️ Urgent Assignment Reminder</h2>
                <p>Hello ${student.name},</p>
                <p>Your assignment "${assignment.title}" is due in 1 hour!</p>
                <p>Please submit it immediately to avoid any late submission penalties.</p>
                <p><strong>Due Date: ${dueDate.toLocaleString()}</strong></p>
              `
            });
          }
        } catch (error) {
          console.error('Error sending final reminders:', error);
        }
      });
    }
  }

  static async getPendingStudents(assignment, allStudents) {
    const submittedStudentIds = assignment.submissions.map(sub => 
      sub.student.toString()
    );
    
    return allStudents.filter(student => 
      !submittedStudentIds.includes(student._id.toString())
    );
  }

  static getMilliseconds(interval) {
    const number = parseInt(interval);
    const unit = interval.slice(-1);
    
    switch(unit) {
      case 'h': return number * 60 * 60 * 1000;
      case 'd': return number * 24 * 60 * 60 * 1000;
      case 'w': return number * 7 * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  }

  static async getPersonalizedRecommendations(student) {
    try {
      if (!student?._id) {
        throw new ErrorHandler('Invalid student data', 400);
      }

      // Cache heavy computations
      const [studentAssignments, recentActivity] = await Promise.all([
        Assignment.find({
          'submissions.student': student._id
        }).lean(),
        ResourceActivity.find({
          student: student._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).lean()
      ]);

      // Rest of the code remains same
    } catch (error) {
      console.error('Error in recommendations:', error);
      throw new ErrorHandler(error.message || 'Failed to generate recommendations', 500);
    }
  }
}