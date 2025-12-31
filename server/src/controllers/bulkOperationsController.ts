import { Request, Response } from 'express'
import { CustomRequest } from '../middleware/auth'
import User from '../models/User'
import Group from '../models/Group'
import Assignment from '../models/Assignment'
import Submission from '../models/Submission'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { sendNotificationToUser } from './pushNotificationController'

/**
 * Export users to CSV
 */
export const exportUsersToCSV = async (req: CustomRequest, res: Response) => {
  try {
    const { role, groupId } = req.query

    let query: any = {}
    if (role) {
      query.role = role
    }

    // If groupId specified, find users in that group
    if (groupId) {
      const group = await Group.findById(groupId).populate('students')
      if (!group) {
        return res.status(404).json({ message: 'Group not found' })
      }
      const studentIds = (group.students as any[]).map(s => s._id)
      query._id = { $in: studentIds }
    }

    const users = await User.find(query).select(
      'email firstName lastName role createdAt accessLevel subscriptionStatus'
    )

    // Build CSV
    const csvRows = [
      ['Email', 'First Name', 'Last Name', 'Role', 'Created At', 'Access Level', 'Subscription Status']
    ]

    users.forEach(user => {
      csvRows.push([
        user.email,
        user.firstName,
        user.lastName || '',
        user.role,
        user.createdAt?.toISOString() || '',
        user.accessLevel || 'free',
        user.subscriptionStatus || '',
      ])
    })

    const csvContent = csvRows.map(row => row.join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-export-${new Date().toISOString()}.csv`
    )
    res.send('\uFEFF' + csvContent) // UTF-8 BOM
  } catch (error: any) {
    console.error('Error exporting users:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Import users from CSV
 * CSV format: email,firstName,lastName,role,password
 */
export const importUsersFromCSV = async (req: CustomRequest, res: Response) => {
  try {
    const { csvData } = req.body

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ message: 'CSV data required' })
    }

    const rows = csvData.trim().split('\n')
    if (rows.length < 2) {
      return res.status(400).json({ message: 'CSV must have header and at least one row' })
    }

    const header = rows[0].split(',').map(h => h.trim().toLowerCase())
    const requiredFields = ['email', 'firstname', 'lastname', 'role', 'password']

    // Validate headers
    for (const field of requiredFields) {
      if (!header.includes(field)) {
        return res.status(400).json({ message: `Missing required field: ${field}` })
      }
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',').map(c => c.trim())
      if (row.length !== header.length) {
        results.errors.push(`Row ${i + 1}: Invalid column count`)
        continue
      }

      const userData: any = {}
      header.forEach((key, index) => {
        userData[key] = row[index]
      })

      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
          results.skipped++
          results.errors.push(`Row ${i + 1}: User ${userData.email} already exists`)
          continue
        }

        // Validate role
        if (!['student', 'teacher', 'admin'].includes(userData.role)) {
          results.errors.push(`Row ${i + 1}: Invalid role ${userData.role}`)
          continue
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10)

        // Create user
        await User.create({
          email: userData.email,
          firstName: userData.firstname,
          lastName: userData.lastname,
          role: userData.role,
          password: hashedPassword,
          subscriptionStatus: 'active',
          subscriptionTier: 'free',
        })

        results.created++
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    res.json({
      message: 'Import completed',
      ...results,
    })
  } catch (error: any) {
    console.error('Error importing users:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (req: CustomRequest, res: Response) => {
  try {
    const { userIds } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array required' })
    }

    // Don't allow deleting yourself
    if (userIds.includes(req.userId)) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    // Delete users
    const result = await User.deleteMany({ _id: { $in: userIds } })

    res.json({
      message: 'Users deleted successfully',
      deletedCount: result.deletedCount,
    })
  } catch (error: any) {
    console.error('Error deleting users:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Bulk update user roles
 */
export const bulkUpdateUserRoles = async (req: CustomRequest, res: Response) => {
  try {
    const { userIds, role } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array required' })
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Don't allow changing your own role
    if (userIds.includes(req.userId)) {
      return res.status(400).json({ message: 'Cannot change your own role' })
    }

    // Update users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { role } }
    )

    res.json({
      message: 'User roles updated successfully',
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    console.error('Error updating user roles:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Bulk add users to group
 */
export const bulkAddUsersToGroup = async (req: CustomRequest, res: Response) => {
  try {
    const { userIds, groupId } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array required' })
    }

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID required' })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check permissions
    if (req.userRole === 'teacher' && group.teacher.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Add users to group (avoid duplicates)
    const existingStudents = group.students.map(s => s.toString())
    const newStudents = userIds.filter(id => !existingStudents.includes(id))

    if (newStudents.length > 0) {
      group.students.push(...newStudents.map(id => new mongoose.Types.ObjectId(id)))
      await group.save()
    }

    res.json({
      message: 'Users added to group successfully',
      addedCount: newStudents.length,
      skippedCount: userIds.length - newStudents.length,
    })
  } catch (error: any) {
    console.error('Error adding users to group:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Bulk upload grades from CSV
 * CSV format: studentEmail,assignmentId,grade,feedback
 */
export const bulkUploadGrades = async (req: CustomRequest, res: Response) => {
  try {
    const { csvData } = req.body

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ message: 'CSV data required' })
    }

    const rows = csvData.trim().split('\n')
    if (rows.length < 2) {
      return res.status(400).json({ message: 'CSV must have header and at least one row' })
    }

    const header = rows[0].split(',').map(h => h.trim().toLowerCase())
    const requiredFields = ['studentemail', 'assignmentid', 'grade']

    // Validate headers
    for (const field of requiredFields) {
      if (!header.includes(field)) {
        return res.status(400).json({ message: `Missing required field: ${field}` })
      }
    }

    const results = {
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',').map(c => c.trim())
      if (row.length < 3) {
        results.errors.push(`Row ${i + 1}: Invalid column count`)
        continue
      }

      const gradeData: any = {}
      header.forEach((key, index) => {
        if (row[index]) gradeData[key] = row[index]
      })

      try {
        // Find student
        const student = await User.findOne({ email: gradeData.studentemail })
        if (!student) {
          results.errors.push(`Row ${i + 1}: Student ${gradeData.studentemail} not found`)
          continue
        }

        // Find assignment
        const assignment = await Assignment.findById(gradeData.assignmentid).populate('group')
        if (!assignment) {
          results.errors.push(`Row ${i + 1}: Assignment ${gradeData.assignmentid} not found`)
          continue
        }

        // Check permissions
        const group = assignment.group as any
        if (req.userRole === 'teacher' && group.teacher.toString() !== req.userId) {
          results.errors.push(`Row ${i + 1}: Access denied for assignment ${gradeData.assignmentid}`)
          continue
        }

        // Validate grade
        const grade = parseFloat(gradeData.grade)
        if (isNaN(grade) || grade < 0 || grade > assignment.maxScore) {
          results.errors.push(`Row ${i + 1}: Invalid grade ${gradeData.grade} (max: ${assignment.maxScore})`)
          continue
        }

        // Find or create submission
        let submission = await Submission.findOne({
          assignment: assignment._id,
          student: student._id,
        })

        if (!submission) {
          // Create submission if doesn't exist
          submission = await Submission.create({
            assignment: assignment._id,
            student: student._id,
            status: 'graded',
            submissionDate: new Date(),
          })
        }

        // Set grade
        await submission.setGrade(
          grade,
          gradeData.feedback || '',
          new mongoose.Types.ObjectId(req.userId!)
        )

        // Send push notification
        sendNotificationToUser(student._id.toString(), {
          title: 'Оценка выставлена',
          body: `${assignment.title?.ru || 'Задание'}: ${grade}/${assignment.maxScore}`,
          icon: '/pwa-192x192.png',
          url: '/grades',
          data: {
            type: 'grade_posted',
            grade,
          },
        }).catch(err => console.error(`Failed to send push notification:`, err))

        results.updated++
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    res.json({
      message: 'Grades upload completed',
      ...results,
    })
  } catch (error: any) {
    console.error('Error uploading grades:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}
