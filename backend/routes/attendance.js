const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const { userId, checkIn } = req.body;
    
    const attendanceData = {
      userId,
      checkIn: checkIn || admin.firestore.FieldValue.serverTimestamp(),
      checkOut: null,
      date: new Date().toISOString().split('T')[0],
    };

    const newAttendance = await db.collection('attendance').add(attendanceData);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendanceId: newAttendance.id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Check out
router.put('/:attendanceId/checkout', async (req, res) => {
  try {
    const { attendanceId } = req.params;

    await db.collection('attendance').doc(attendanceId).update({
      checkOut: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Checked out successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user attendance
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    let query = db.collection('attendance').where('userId', '==', userId);

    // Filter by month/year if provided
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    }

    const attendanceSnapshot = await query.orderBy('date', 'desc').get();
    const attendance = [];

    attendanceSnapshot.forEach((doc) => {
      attendance.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all attendance (Admin)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    let query = db.collection('attendance');

    if (date) {
      query = query.where('date', '==', date);
    }

    const attendanceSnapshot = await query.orderBy('checkIn', 'desc').limit(100).get();
    const attendance = [];

    attendanceSnapshot.forEach((doc) => {
      attendance.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
