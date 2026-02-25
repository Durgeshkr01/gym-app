const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Get all workout plans
router.get('/', async (req, res) => {
  try {
    const workoutsSnapshot = await db.collection('workouts').get();
    const workouts = [];

    workoutsSnapshot.forEach((doc) => {
      workouts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get workout by ID
router.get('/:workoutId', async (req, res) => {
  try {
    const { workoutId } = req.params;
    const workoutDoc = await db.collection('workouts').doc(workoutId).get();

    if (!workoutDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    res.json({
      success: true,
      workout: workoutDoc.data(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Create new workout plan
router.post('/', async (req, res) => {
  try {
    const workoutData = req.body;
    
    const newWorkout = await db.collection('workouts').add({
      ...workoutData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      workoutId: newWorkout.id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update workout plan
router.put('/:workoutId', async (req, res) => {
  try {
    const { workoutId } = req.params;
    const updates = req.body;

    await db.collection('workouts').doc(workoutId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Workout updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete workout plan
router.delete('/:workoutId', async (req, res) => {
  try {
    const { workoutId } = req.params;
    await db.collection('workouts').doc(workoutId).delete();

    res.json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
