const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Get all membership plans
router.get('/plans', async (req, res) => {
  try {
    const plansSnapshot = await db.collection('membershipPlans').get();
    const plans = [];

    plansSnapshot.forEach((doc) => {
      plans.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Create membership plan (Admin)
router.post('/plans', async (req, res) => {
  try {
    const planData = req.body;
    
    const newPlan = await db.collection('membershipPlans').add({
      ...planData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: 'Membership plan created successfully',
      planId: newPlan.id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Subscribe to membership
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, planId, startDate, duration } = req.body;
    
    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    const subscriptionData = {
      userId,
      planId,
      startDate: startDate,
      endDate: end.toISOString().split('T')[0],
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const newSubscription = await db.collection('subscriptions').add(subscriptionData);

    // Update user membership status
    await db.collection('users').doc(userId).update({
      membershipStatus: 'active',
      currentSubscription: newSubscription.id,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscriptionId: newSubscription.id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user subscription
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const subscriptionSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (subscriptionSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    const subscription = {
      id: subscriptionSnapshot.docs[0].id,
      ...subscriptionSnapshot.docs[0].data(),
    };

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Cancel subscription
router.put('/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    await db.collection('subscriptions').doc(subscriptionId).update({
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
