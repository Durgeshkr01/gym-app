import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { db, ref, onValue, set, get, push, update, remove } from '../config/firebase';

const DataContext = createContext();

// Firebase paths (new app stores under appData/ so old app's gymData/ stays intact)
const P = {
  MEMBERS: 'appData/members',
  ATTENDANCE: 'appData/attendance',
  PAYMENTS: 'appData/payments',
  ENQUIRIES: 'appData/enquiries',
  NOTIFICATIONS: 'appData/notifications',
  PLANS: 'appData/plans',
  SETTINGS: 'appData/settings',
  WORKOUT_PLANS: 'appData/workoutPlans',
  DIET_PLANS: 'appData/dietPlans',
  MSG_TEMPLATES: 'appData/messageSettings',
  ROLL_COUNTER: 'appData/rollCounter',
  MIGRATED: 'appData/_migrated',
};

// ============= DEFAULTS =============
const DEFAULT_PLANS = [
  { id: '1', name: 'Monthly', duration: 30, price: 500, description: '1 Month Membership' },
  { id: '2', name: 'Quarterly', duration: 90, price: 1200, description: '3 Months Membership' },
  { id: '3', name: 'Half Yearly', duration: 180, price: 2000, description: '6 Months Membership' },
  { id: '4', name: 'Yearly', duration: 365, price: 3500, description: '12 Months Membership' },
];

const DEFAULT_SETTINGS = {
  gymName: 'SG Fitness Evolution',
  gymPhone: '',
  gymAddress: '',
  admissionFee: 200,
  expiryAlertDays: 7,
  birthdayWish: true,
  expiryReminder: true,
  duesReminder: true,
};

const DEFAULT_TEMPLATES = {
  birthday: {
    whatsapp: '🎂 *Happy Birthday {name} Ji!* 🎉\n\n{gym_name} parivar ki taraf se aapko janamdin ki bahut bahut hardik shubhkamnaayein! 🎊\n\n💪 Aap hamesha aise hi fit, healthy aur khush rahein!\nAapki fitness journey ka safar aur bhi behtareen ho — yahi dua hai humari! 🙏\n\n❤️ *{gym_name} Family* 🏋️',
    sms: 'Happy Birthday {name} Ji! 🎂 {gym_name} family ki taraf se aapko dil se shubhkamnaayein! Fit & healthy rahein! 💪 - {gym_name}',
  },
  expiry: {
    whatsapp: '⚠️ *Membership Renewal Reminder*\n\nNamaste *{name} Ji*, 🙏\n\nAapki *{gym_name}* membership *{expiry_date}* ko expire hone wali hai.\n\n📋 *Membership Details:*\n• Plan: {plan}\n• Expiry Date: {expiry_date}\n\n✅ Samay par renew karein aur bina kisi rok-tok ke apni fitness journey jaari rakhein! 💪🔥\n\nRenewal ke liye gym mein aayein ya hamse sampark karein:\n📞 {gym_phone}\n\nDhanyawad! 🙏\n— *{gym_name} Team* 🏋️',
    sms: 'Namaste {name} Ji, aapki {gym_name} membership {expiry_date} ko expire hogi. Plan: {plan}. Jaldi renew karein. Contact: {gym_phone} - {gym_name}',
  },
  welcome: {
    whatsapp: '🎉 *{gym_name} mein Swagat Hai!*\n\nNamaste *{name} Ji*, 🙏\n\nAap {gym_name} parivar ka hissa ban gaye hain — hum bahut khush hain! ❤️\n\n📋 *Aapki Membership Details:*\n• Plan: {plan}\n• Start Date: {start_date}\n• Valid Till: {expiry_date}\n\n💪 Consistency se aayein, dedication se kaam karein — results zaroor milenge! 🔥\n\n🏋️ Hum hain aapke saath har kadam par!\nKisi bhi madad ke liye:\n📞 {gym_phone}\n\n— *{gym_name} Family* ❤️',
    sms: 'Welcome {name} Ji! {gym_name} mein aapka swagat hai. Plan: {plan}, Start: {start_date}, Valid till: {expiry_date}. Happy training! 💪 Contact: {gym_phone}',
  },
  dues: {
    whatsapp: '🙏 *Namaste {name} Ji,*\n\n{gym_name} ki taraf se aapko yaad dilana chahte hain ki aapka *₹{due_amount}* ka payment abhi baaki hai.\n\nKripya jaldi se jaldi suvidhaanusaar payment clear kar dein taaki aapki membership smoothly chalti rahe. ✅\n\nHumara maksad sirf aapki fitness journey ko uninterrupted rakhna hai! 😊\n\nPayment ke liye gym mein aayein:\n📞 {gym_phone}\n\nDhanyawad! 🙏\n— *{gym_name} Team*',
    sms: 'Namaste {name} Ji, {gym_name} mein aapka ₹{due_amount} payment baaki hai. Kripya jald clear karein. Contact: {gym_phone}. Dhanyawad! - {gym_name}',
  },
  renewal: {
    whatsapp: '✅ *Membership Successfully Renewed!*\n\nNamaste *{name} Ji*, 🎉\n\nAapki *{gym_name}* membership successfully renew ho gayi hai!\nAap par bharosa rakhne ke liye bahut bahut shukriya! ❤️\n\n📋 *Updated Membership Details:*\n• Plan: {plan}\n• Valid Till: {expiry_date}\n\n🔥 Ab poori taaqat se workout karein!\nHum hain aapke saath har kadam par! 💪🏋️\n\n— *{gym_name} Family* 🙏',
    sms: '{name} Ji, {gym_name} membership renew! Plan: {plan}, Valid till: {expiry_date}. Shukriya! 💪 - {gym_name}',
  },
  checkin: {
    whatsapp: '✅ *Attendance Marked!*\n\nNamaste *{name} Ji*, 💪\n\nAap aaj {gym_name} aaye — bahut acha kiya! 🙌\n\n🔥 *"Consistency hi success ki asli chaabi hai!"*\n\nAaj ka session crush karein aur apna best dein! 🏋️💪\n\n— *{gym_name} Team*',
    sms: 'Hi {name} Ji, {gym_name} mein aapki attendance mark ho gayi! Consistency rakhen — results zaroor milenge! 💪 - {gym_name}',
  },
  inactive: {
    whatsapp: '😊 *Namaste {name} Ji,*\n\nHum {gym_name} parivar se aapko bahut miss kar rahe hain! 🙁\n\nKaafi time ho gaya aapka gym mein aaye hue — sab theek toh hai na?\n\nYaad rahe — fitness ek lifelong journey hai, aur ek chhota sa break sab khatam nahi karta! 💪\n\nAaj wapas aayein, hum aapka intezaar kar rahe hain! 🏋️🔥\n\n📞 {gym_phone}\n\n— *{gym_name} Family* ❤️',
    sms: 'Namaste {name} Ji, {gym_name} mein bahut miss kar rahe hain! Wapas aayein aur fitness journey continue karein. Hum intezaar mein hain! 💪 Contact: {gym_phone}',
  },
  general: {
    whatsapp: '🙏 *Namaste {name} Ji,*\n\nYeh zaroori message {gym_name} ki taraf se hai.\n\nKisi bhi jaankari ya sahayata ke liye hum hamesha aapki seva mein taiyaar hain.\n📞 {gym_phone}\n\nDhanyawad! 🙏\n— *{gym_name} Team* 🏋️',
    sms: 'Namaste {name} Ji, {gym_name} ki taraf se message. Koi help ke liye: {gym_phone}. Dhanyawad! - {gym_name}',
  },
  custom: { whatsapp: '', sms: '' },
};

const DEFAULT_WORKOUT_PLANS = [
  {
    id: 'w1', name: 'Beginner Full Body', category: 'Full Body', duration: '45 mins',
    description: '3 din/week. Har muscle group ke liye basic exercises.',
    exercises: ['Warm Up — 5 min brisk walk / jumping jacks', 'Push-ups — 3 sets x 15 reps', 'Bodyweight Squats — 3 sets x 20 reps', 'Dumbbell Rows — 3 sets x 12 reps (each side)', 'Lunges — 3 sets x 12 reps (each leg)', 'Plank — 3 sets x 30 seconds', 'Dumbbell Shoulder Press — 3 sets x 12 reps', 'Cool Down Stretch — 5 min'],
  },
  {
    id: 'w2', name: 'Intermediate Push-Pull-Legs', category: 'Split', duration: '60 mins',
    description: '6 din/week split. Muscle hypertrophy ke liye best.',
    exercises: ['Push Day: Bench Press 4x10, Incline DB Press 3x12, Cable Fly 3x15, Shoulder Press 4x10, Lateral Raise 3x15, Tricep Pushdown 3x12', 'Pull Day: Deadlift 4x8, Pull-ups 4x8, Seated Cable Row 4x10, Face Pull 3x15, Barbell Curl 3x12, Hammer Curl 3x12', 'Leg Day: Back Squat 4x10, Leg Press 4x12, Romanian Deadlift 3x10, Leg Curl 3x12, Calf Raises 4x20'],
  },
  {
    id: 'w3', name: 'Advanced Strength & Power', category: 'Strength', duration: '75 mins',
    description: 'Heavy compound lifts. Experienced gym members ke liye.',
    exercises: ['Back Squat — 5 sets x 5 reps (heavy)', 'Barbell Deadlift — 5 sets x 5 reps (heavy)', 'Bench Press — 5 sets x 5 reps (heavy)', 'Weighted Pull-ups — 4 sets x 6 reps', 'Overhead Press — 4 sets x 6 reps', 'Power Cleans — 4 sets x 4 reps', 'Barbell Row — 4 sets x 6 reps', 'Core: Ab Wheel Rollout 3x10'],
  },
  {
    id: 'w4', name: 'Weight Loss Cardio Mix', category: 'Cardio + Strength', duration: '40 mins',
    description: 'Fat burn ke liye. Cardio + light weights combination.',
    exercises: ['Treadmill Warm Up — 5 min (moderate pace)', 'Jump Squats — 3 sets x 15 reps', 'Burpees — 3 sets x 10 reps', 'Mountain Climbers — 3 sets x 20 reps', 'Kettlebell Swings — 3 sets x 15 reps', 'Box Jumps — 3 sets x 10 reps', 'Battle Ropes — 3 sets x 30 seconds', 'Treadmill HIIT — 10 min (1 min fast / 1 min slow)', 'Cool Down — 5 min walking'],
  },
  {
    id: 'w5', name: 'Home Workout (No Equipment)', category: 'Home Workout', duration: '35 mins',
    description: 'Ghar par bina equipment ke kiya ja sakta hai.',
    exercises: ['Jumping Jacks — 3 sets x 30 reps', 'Push-ups — 4 sets x 20 reps', 'Bodyweight Squats — 4 sets x 25 reps', 'Glute Bridge — 3 sets x 20 reps', 'Tricep Dips (chair) — 3 sets x 15 reps', 'High Knees — 3 sets x 30 seconds', 'Superman Hold — 3 sets x 15 reps', 'Plank — 3 sets x 45 seconds', 'Bicycle Crunches — 3 sets x 20 reps'],
  },
];

const DEFAULT_DIET_PLANS = [
  {
    id: 'd1', name: 'Weight Gain (3000 cal)', type: 'Weight Gain', calories: '3000',
    description: 'Muscle mass badhane ke liye high protein & calorie diet.',
    meals: ['🌅 5:30 AM — Khali pet 2 glass garam paani + soaked almonds (10)', '🍳 7:00 AM Breakfast — 6 Boiled Eggs + 1 bowl Oats + 1 Banana + 1 glass Milk', '🥤 10:00 AM Snack — Protein Shake (1.5 scoop) + Peanut Butter Bread (2 slice)', '🍱 1:00 PM Lunch — 3 Roti/Rice + 200g Chicken Curry + Salad + Dal', '🍌 4:00 PM Pre-Workout — Banana + Dry Fruits + Black Coffee', '🥗 7:00 PM Post-Workout — Protein Shake + 2 Boiled Eggs', '🍛 8:30 PM Dinner — 2 Roti + Paneer Bhurji + Mixed Vegetables + Dal', '🥛 10:00 PM Before Bed — 1 glass Milk + 5 Almonds'],
  },
  {
    id: 'd2', name: 'Weight Loss (1800 cal)', type: 'Weight Loss', calories: '1800',
    description: 'Fat burn ke liye low calorie, high protein diet.',
    meals: ['🌅 5:30 AM — Garam paani + nimbu + shahad', '🍳 7:00 AM Breakfast — 3 Egg Whites + 1 bowl Oats (no sugar) + Green Tea', '🥤 10:00 AM Snack — 1 Apple / Cucumber + 1 cup Green Tea', '🍱 1:00 PM Lunch — 1 cup Brown Rice + Grilled Chicken 150g + Salad (no dressing)', '🍊 4:00 PM Snack — Sprouts Salad + Black Coffee (no sugar)', '🏋️ Pre-Workout — Banana (half) + Green Tea', '🥗 7:00 PM Post-Workout — 2 Egg Whites + 1 cup low-fat curd', '🍛 8:30 PM Dinner — 2 Multigrain Roti + Fish Curry (less oil) + Sabzi', '💧 Before Bed — Warm water + jeera powder'],
  },
  {
    id: 'd3', name: 'Maintenance (2200 cal)', type: 'Maintenance', calories: '2200',
    description: 'Current weight maintain karne ke liye balanced diet.',
    meals: ['🌅 6:00 AM — Warm water + soaked nuts', '🍳 8:00 AM Breakfast — Poha / Upma + 4 Boiled Eggs + 1 glass Milk', '🥤 11:00 AM Snack — Fruit + Yogurt / Lassi', '🍱 1:30 PM Lunch — 2-3 Roti + Dal + Sabzi + Salad + Curd', '🍌 4:30 PM Snack — Protein Bar / Peanut Butter Bread', '🏋️ Pre-Workout — Black Coffee + Banana', '🥗 7:30 PM Post-Workout — Protein Shake or 2 Eggs', '🍛 9:00 PM Dinner — 2 Roti + Chicken / Paneer Curry + Salad', '🥛 Before Bed — 1 glass Milk'],
  },
  {
    id: 'd4', name: 'Vegetarian Muscle Gain', type: 'Vegetarian', calories: '2800',
    description: 'Pure vegetarian. Muscle gain ke liye high protein veg diet.',
    meals: ['🌅 5:30 AM — Soaked chana (1 cup) + garam paani', '🍳 7:00 AM Breakfast — Besan Chilla 3 pcs + Paneer Bhurji + 1 glass Milk', '🥤 10:00 AM Snack — Soya Protein Shake + Banana', '🍱 1:00 PM Lunch — 2 cup Rice + Rajma / Chole + Paneer Sabzi + Salad', '🥗 4:00 PM Snack — Sprouts 1 bowl + Fruits + Nuts', '🏋️ Pre-Workout — Banana + Jaggery + Black Coffee', '🥤 Post-Workout — Whey Protein / Soya Shake + 1 Banana', '🍛 8:30 PM Dinner — 3 Roti + Dal Makhani + Tofu Sabzi', '🥛 Before Bed — 1 glass Haldi Milk + Ashwagandha'],
  },
];

// ============= HELPER FUNCTIONS =============
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
};

const isThisWeek = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo && d <= now;
};

const isThisMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

// Convert "12:43 pm" → "12:43"
const convertTo24h = (t) => {
  if (!t) return '00:00';
  const m = t.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return '00:00';
  let h = parseInt(m[1]);
  if (m[3].toLowerCase() === 'pm' && h !== 12) h += 12;
  if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};

// Firebase object → array (skips nulls)
const fbToArray = (obj) => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj.filter(Boolean);
  return Object.entries(obj)
    .filter(([_, v]) => v != null)
    .map(([key, val]) => ({ ...val, id: val.id || key }));
};

// ============= DATA MIGRATION (Old gymData → New appData) =============
const migrateFromOldApp = async () => {
  try {
    const migratedSnap = await get(ref(db, P.MIGRATED));

    // Even if migrated flag is set, check if appData/members is actually populated
    if (migratedSnap.val()) {
      const existingMembers = await get(ref(db, P.MEMBERS));
      if (existingMembers.val()) return; // Data is there, all good
      // Migrated flag set but data missing — force re-migration
      await remove(ref(db, P.MIGRATED));
    }

    const oldSnap = await get(ref(db, 'gymData'));
    const old = oldSnap.val();

    if (!old || !old.members) {
      // No old data - just mark as migrated
      await set(ref(db, P.MIGRATED), { at: new Date().toISOString() });
      return;
    }
    const updates = {};
    let maxRoll = 0;

    // --- Plans first (need for member mapping) ---
    const plansMap = {};
    if (old.plans) {
      Object.values(old.plans).filter(Boolean).forEach(p => {
        const pid = String(p.id);
        plansMap[pid] = {
          id: pid, name: p.name || '', duration: p.days || 30,
          price: p.price || 0, description: p.desc || '',
        };
        updates[`${P.PLANS}/${pid}`] = plansMap[pid];
      });
    }

    // --- Members + extract Payments ---
    if (old.members) {
      Object.entries(old.members).forEach(([idx, m]) => {
        if (!m) return;
        const mid = String(m.id || idx);
        const rollNo = parseInt(mid) || parseInt(idx);
        if (rollNo > maxRoll) maxRoll = rollNo;

        const matchedPlan = Object.values(plansMap).find(p => String(p.id) === String(m.planId));
        let totalPaid = 0;

        // Extract payment history into separate payments collection
        if (m.paymentHistory && Array.isArray(m.paymentHistory)) {
          m.paymentHistory.forEach((ph, pi) => {
            const payId = `p_${mid}_${pi}`;
            totalPaid += (ph.amount || 0);
            let payDate;
            try {
              payDate = ph.date ? new Date(`${ph.date}T${convertTo24h(ph.time)}:00`).toISOString() : new Date().toISOString();
            } catch (e) { payDate = new Date().toISOString(); }

            updates[`${P.PAYMENTS}/${payId}`] = {
              id: payId, memberId: mid, memberName: m.fullName || '',
              amount: ph.amount || 0, type: pi === 0 ? 'New Admission' : 'Renewal',
              plan: matchedPlan?.name || '', date: payDate,
              status: 'paid', mode: ph.mode || 'Cash',
            };
          });
        }

        let createdAt;
        try { createdAt = m.joinDate ? new Date(m.joinDate + 'T00:00:00').toISOString() : new Date().toISOString(); }
        catch (e) { createdAt = new Date().toISOString(); }

        updates[`${P.MEMBERS}/${mid}`] = {
          id: mid, rollNo,
          name: m.fullName || '', fatherName: m.fatherName || '',
          phone: m.mobileNumber || '', altPhone: '', email: '',
          dob: m.dob || '', age: '', gender: m.gender || '',
          height: '', weight: '', address: '', bloodGroup: '',
          photo: null,
          plan: matchedPlan?.name || '', planId: String(m.planId || ''),
          planAmount: matchedPlan?.price || 0,
          admissionFee: 0, discount: 0, paymentMode: 'Cash',
          totalAmount: totalPaid + (m.dueAmount || 0),
          paidAmount: totalPaid, dueAmount: m.dueAmount || 0,
          startDate: m.joinDate || '', endDate: m.expiryDate || '',
          status: m.status || 'active', notes: '', createdAt,
        };
      });
    }

    // --- Attendance ---
    if (old.attendance) {
      Object.entries(old.attendance).forEach(([key, a]) => {
        if (!a) return;
        let ts;
        try { ts = new Date(`${a.date}T${convertTo24h(a.entryTime)}:00`).toISOString(); }
        catch (e) { ts = new Date().toISOString(); }

        updates[`${P.ATTENDANCE}/${key}`] = {
          id: a.id || key, memberId: String(a.memberId),
          memberName: a.memberName || '', memberRollNo: a.serialNumber || '',
          type: 'checkin', timestamp: ts,
        };
      });
    }

    // --- Enquiries ---
    if (old.enquiries) {
      Object.entries(old.enquiries).forEach(([key, e]) => {
        if (!e) return;
        const eid = String(e.id || key);
        updates[`${P.ENQUIRIES}/${eid}`] = {
          id: eid, name: e.name || '', phone: e.mobile || '',
          interest: e.plan || 'Gym', source: 'Walk-in',
          notes: e.notes || '', status: e.status || 'new',
          createdAt: e.date || new Date().toISOString(),
        };
      });
    }

    // --- Settings ---
    if (old.settings && typeof old.settings === 'object' && !Array.isArray(old.settings)) {
      const s = old.settings;
      updates[P.SETTINGS] = {
        gymName: s.gymName || 'SG Fitness Evolution',
        gymPhone: s.phone || s.whatsapp || '',
        gymAddress: s.address || '',
        email: s.email || '',
        openTime: s.openTime || '',
        closeTime: s.closeTime || '',
        maxCapacity: s.maxCapacity || 50,
        admissionFee: 200,
        expiryAlertDays: s.expiryAlertDays || 7,
        birthdayWish: true, expiryReminder: true, duesReminder: true,
        tagline: s.tagline || '',
      };
    }

    // --- Message Templates ---
    if (old.messageSettings && typeof old.messageSettings === 'object') {
      const ms = old.messageSettings;
      updates[P.MSG_TEMPLATES] = {
        birthday: { whatsapp: ms.birthdayWish || DEFAULT_TEMPLATES.birthday.whatsapp, sms: DEFAULT_TEMPLATES.birthday.sms },
        welcome: { whatsapp: ms.newAdmission || DEFAULT_TEMPLATES.welcome.whatsapp, sms: DEFAULT_TEMPLATES.welcome.sms },
        expiry: { whatsapp: ms.expiredMember || DEFAULT_TEMPLATES.expiry.whatsapp, sms: DEFAULT_TEMPLATES.expiry.sms },
        renewal: { whatsapp: ms.expiringSoon || DEFAULT_TEMPLATES.renewal.whatsapp, sms: DEFAULT_TEMPLATES.renewal.sms },
        dues: { whatsapp: ms.duesReminder || DEFAULT_TEMPLATES.dues.whatsapp, sms: DEFAULT_TEMPLATES.dues.sms },
        general: DEFAULT_TEMPLATES.general,
        checkin: DEFAULT_TEMPLATES.checkin,
        inactive: DEFAULT_TEMPLATES.inactive,
        custom: DEFAULT_TEMPLATES.custom,
      };
    }

    // Roll counter & migration flag
    updates[P.ROLL_COUNTER] = maxRoll + 1;
    updates[P.MIGRATED] = { at: new Date().toISOString(), membersMigrated: Object.keys(updates).filter(k => k.startsWith(P.MEMBERS + '/')).length };

    // Write everything in one atomic update
    await update(ref(db), updates);
  } catch (e) {
    console.error('Migration error:', e);
  }
};

// ============= DATA PROVIDER =============
export function DataProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [workoutPlans, setWorkoutPlans] = useState(DEFAULT_WORKOUT_PLANS);
  const [dietPlans, setDietPlans] = useState(DEFAULT_DIET_PLANS);
  const [messageTemplates, setMessageTemplates] = useState(DEFAULT_TEMPLATES);
  const [rollCounter, setRollCounter] = useState(1);
  const [loading, setLoading] = useState(true);

  // Refs for accessing latest data in callbacks (avoids stale closure)
  const membersR = useRef(members);
  const attendanceR = useRef(attendance);
  const paymentsR = useRef(payments);
  const notificationsR = useRef(notifications);
  const plansR = useRef(plans);
  const settingsR = useRef(settings);
  const rollR = useRef(rollCounter);
  const msgTemplatesR = useRef(messageTemplates);

  useEffect(() => { membersR.current = members; }, [members]);
  useEffect(() => { attendanceR.current = attendance; }, [attendance]);
  useEffect(() => { paymentsR.current = payments; }, [payments]);
  useEffect(() => { notificationsR.current = notifications; }, [notifications]);
  useEffect(() => { plansR.current = plans; }, [plans]);
  useEffect(() => { settingsR.current = settings; }, [settings]);
  useEffect(() => { rollR.current = rollCounter; }, [rollCounter]);
  useEffect(() => { msgTemplatesR.current = messageTemplates; }, [messageTemplates]);

  // ============= FIREBASE LISTENERS =============
  useEffect(() => {
    let mounted = true;
    let cleanups = [];

    const init = async () => {
      // Run migration first (one-time, old gymData → new appData)
      await migrateFromOldApp();

      // Setup real-time listeners
      cleanups.push(onValue(ref(db, P.MEMBERS), snap => {
        if (mounted) setMembers(fbToArray(snap.val()));
      }));
      cleanups.push(onValue(ref(db, P.ATTENDANCE), snap => {
        if (mounted) setAttendance(fbToArray(snap.val()));
      }));
      cleanups.push(onValue(ref(db, P.PAYMENTS), snap => {
        if (mounted) setPayments(fbToArray(snap.val()));
      }));
      cleanups.push(onValue(ref(db, P.ENQUIRIES), snap => {
        if (mounted) setEnquiries(fbToArray(snap.val()));
      }));
      cleanups.push(onValue(ref(db, P.NOTIFICATIONS), snap => {
        if (mounted) setNotifications(fbToArray(snap.val()));
      }));
      cleanups.push(onValue(ref(db, P.PLANS), snap => {
        const val = snap.val();
        if (mounted && val) setPlans(fbToArray(val));
      }));
      cleanups.push(onValue(ref(db, P.SETTINGS), snap => {
        const val = snap.val();
        if (mounted && val && typeof val === 'object') setSettings(val);
      }));
      cleanups.push(onValue(ref(db, P.WORKOUT_PLANS), snap => {
        const val = snap.val();
        if (mounted && val) setWorkoutPlans(fbToArray(val));
      }));
      cleanups.push(onValue(ref(db, P.DIET_PLANS), snap => {
        const val = snap.val();
        if (mounted && val) setDietPlans(fbToArray(val));
      }));
      cleanups.push(onValue(ref(db, P.MSG_TEMPLATES), snap => {
        const val = snap.val();
        if (mounted && val && typeof val === 'object') setMessageTemplates(val);
      }));
      cleanups.push(onValue(ref(db, P.ROLL_COUNTER), snap => {
        const val = snap.val();
        if (mounted && val) setRollCounter(val);
      }));

      if (mounted) setLoading(false);
    };

    init();

    return () => {
      mounted = false;
      cleanups.forEach(unsub => unsub && unsub());
    };
  }, []);

  // ============= MEMBER FUNCTIONS =============
  const addMember = useCallback(async (memberData) => {
    const currentRoll = rollR.current;
    const newRoll = memberData.rollNo || currentRoll;
    const plan = plansR.current.find(p =>
      p.id === memberData.planId || p.name?.toLowerCase() === memberData.plan?.toLowerCase()
    );
    const endDate = memberData.endDate || (plan ? addDays(memberData.startDate || formatDate(new Date()), plan.duration) : '');

    const totalAmount = (parseFloat(memberData.admissionFee) || 0) + (parseFloat(memberData.planAmount) || plan?.price || 0) - (parseFloat(memberData.discount) || 0);
    const paidAmount = parseFloat(memberData.paidAmount) || 0;
    const dueAmount = totalAmount - paidAmount;

    const newRef = push(ref(db, P.MEMBERS));
    const member = {
      id: newRef.key,
      rollNo: newRoll,
      name: memberData.name || '',
      fatherName: memberData.fatherName || '',
      phone: memberData.phone || '',
      altPhone: memberData.altPhone || '',
      email: memberData.email || '',
      dob: memberData.dob || '',
      age: memberData.age || '',
      gender: memberData.gender || '',
      address: memberData.address || '',
      height: memberData.height || '',
      weight: memberData.weight || '',
      bloodGroup: memberData.bloodGroup || '',
      photo: memberData.photo || null,
      plan: plan?.name || memberData.plan || '',
      planId: plan?.id || '',
      planAmount: parseFloat(memberData.planAmount) || plan?.price || 0,
      admissionFee: parseFloat(memberData.admissionFee) || 0,
      discount: parseFloat(memberData.discount) || 0,
      paymentMode: memberData.paymentMode || 'Cash',
      totalAmount,
      paidAmount,
      dueAmount,
      startDate: memberData.startDate || formatDate(new Date()),
      endDate,
      status: 'active',
      notes: memberData.notes || '',
      createdAt: new Date().toISOString(),
    };

    await set(newRef, member);

    // Update roll counter
    const nextRoll = Math.max(currentRoll, (typeof newRoll === 'number' ? newRoll : parseInt(newRoll) || currentRoll) + 1);
    await set(ref(db, P.ROLL_COUNTER), nextRoll);

    // Add payment record if paid
    if (paidAmount > 0) {
      await addPayment({
        memberId: member.id,
        memberName: member.name,
        amount: paidAmount,
        type: 'New Admission',
        plan: member.plan,
        status: dueAmount > 0 ? 'partial' : 'paid',
      });
    }

    // Welcome notification
    await addNotification({
      type: 'welcome',
      title: 'New Member Added',
      message: `${member.name} joined with ${member.plan} plan`,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
    });

    return member;
  }, []);

  const updateMember = useCallback(async (memberId, updates) => {
    const member = membersR.current.find(m => m.id === memberId);
    if (!member) return;

    const totalAmount = (parseFloat(updates.admissionFee ?? member.admissionFee) || 0) +
      (parseFloat(updates.planAmount ?? member.planAmount) || 0) -
      (parseFloat(updates.discount ?? member.discount) || 0);
    const paidAmount = parseFloat(updates.paidAmount ?? member.paidAmount) || 0;

    await update(ref(db, `${P.MEMBERS}/${memberId}`), {
      ...updates,
      totalAmount,
      paidAmount,
      dueAmount: totalAmount - paidAmount,
    });
  }, []);

  const deleteMember = useCallback(async (memberId) => {
    try {
      if (!memberId) {
        Alert.alert('Error', 'Member ID missing');
        return false;
      }
      await remove(ref(db, `${P.MEMBERS}/${memberId}`));
      return true;
    } catch (e) {
      console.error('deleteMember error:', e);
      Alert.alert('Delete Failed', `Firebase error: ${e?.message || e}\n\nFirebase Rules check karo — delete permission deni hogi.`);
      return false;
    }
  }, []);

  const renewMember = useCallback(async (memberId, planId, paidAmount, discount = 0, customStartDate = null, customEndDate = null) => {
    const plan = plansR.current.find(p => p.id === planId);
    if (!plan) return;
    const member = membersR.current.find(m => m.id === memberId);
    if (!member) return;

    const startDate = customStartDate || formatDate(new Date());
    const endDate = customEndDate || addDays(startDate, plan.duration);
    const totalAmount = plan.price - discount;
    const paid = parseFloat(paidAmount) || 0;
    const due = totalAmount - paid;

    await update(ref(db, `${P.MEMBERS}/${memberId}`), {
      plan: plan.name, planId: plan.id, planAmount: plan.price,
      startDate, endDate, status: 'active', discount, totalAmount,
      paidAmount: (member.paidAmount || 0) + paid, dueAmount: due,
    });

    if (paid > 0) {
      await addPayment({
        memberId, memberName: member.name, amount: paid,
        type: 'Renewal', plan: plan.name, status: due > 0 ? 'partial' : 'paid',
      });
    }
  }, []);

  const getMemberStatus = useCallback((member) => {
    if (!member.endDate) return 'active';
    const daysLeft = daysBetween(formatDate(new Date()), member.endDate);
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= (settingsR.current.expiryAlertDays || 7)) return 'expiring';
    return 'active';
  }, []);

  // ============= ATTENDANCE FUNCTIONS =============
  const checkIn = useCallback(async (memberId) => {
    const member = membersR.current.find(m => m.id === memberId);
    if (!member) return false;

    // Check if already checked in today without checkout
    const todayCheckins = attendanceR.current.filter(a =>
      a.memberId === memberId && a.type === 'checkin' && isToday(a.timestamp)
    );
    const todayCheckouts = attendanceR.current.filter(a =>
      a.memberId === memberId && a.type === 'checkout' && isToday(a.timestamp)
    );
    if (todayCheckins.length > todayCheckouts.length) {
      Alert.alert('Already In', `${member.name} is already checked in`);
      return false;
    }

    const newRef = push(ref(db, P.ATTENDANCE));
    await set(newRef, {
      id: newRef.key, memberId, memberName: member.name,
      memberPhone: member.phone || '', memberRollNo: member.rollNo,
      type: 'checkin', timestamp: new Date().toISOString(),
    });
    return true;
  }, []);

  const checkOut = useCallback(async (memberId) => {
    const member = membersR.current.find(m => m.id === memberId);
    if (!member) return false;

    const newRef = push(ref(db, P.ATTENDANCE));
    await set(newRef, {
      id: newRef.key, memberId, memberName: member.name,
      memberPhone: member.phone || '', memberRollNo: member.rollNo,
      type: 'checkout', timestamp: new Date().toISOString(),
    });
    return true;
  }, []);

  const getTodayAttendance = useCallback(() => {
    const todayRecords = attendance.filter(a => isToday(a.timestamp));
    const checkIns = todayRecords.filter(a => a.type === 'checkin');
    const checkOuts = todayRecords.filter(a => a.type === 'checkout');

    const checkedInIds = new Set();
    for (const r of todayRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))) {
      if (r.type === 'checkin') checkedInIds.add(r.memberId);
      if (r.type === 'checkout') checkedInIds.delete(r.memberId);
    }

    return {
      todayCheckIns: checkIns.length,
      todayCheckOuts: checkOuts.length,
      currentlyInGym: checkedInIds.size,
      currentlyInMembers: [...checkedInIds].map(id => members.find(m => m.id === id)).filter(Boolean),
      history: todayRecords,
    };
  }, [attendance, members]);

  // ============= PAYMENT FUNCTIONS =============
  const addPayment = useCallback(async (paymentData) => {
    const newRef = push(ref(db, P.PAYMENTS));
    const payment = {
      id: newRef.key,
      memberId: paymentData.memberId,
      memberName: paymentData.memberName,
      amount: parseFloat(paymentData.amount) || 0,
      type: paymentData.type || 'Payment',
      plan: paymentData.plan || '',
      date: new Date().toISOString(),
      status: paymentData.status || 'paid',
      mode: paymentData.mode || 'Cash',
      notes: paymentData.notes || '',
    };
    await set(newRef, payment);
    return payment;
  }, []);

  const collectDues = useCallback(async (memberId, amount) => {
    const member = membersR.current.find(m => m.id === memberId);
    if (!member) return;

    const paid = parseFloat(amount) || 0;
    const newPaid = (member.paidAmount || 0) + paid;
    const newDue = (member.totalAmount || 0) - newPaid;

    await update(ref(db, `${P.MEMBERS}/${memberId}`), {
      paidAmount: newPaid,
      dueAmount: Math.max(0, newDue),
    });

    await addPayment({
      memberId, memberName: member.name, amount: paid,
      type: 'Dues Collection', plan: member.plan,
      status: newDue <= 0 ? 'paid' : 'partial',
    });
  }, []);

  const deletePayment = useCallback(async (paymentId) => {
    try {
      if (!paymentId) {
        Alert.alert('Error', 'Payment ID not found');
        return false;
      }
      // Delete from Firebase first
      await remove(ref(db, `${P.PAYMENTS}/${paymentId}`));
      // Then update local state so UI refreshes immediately
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      return true;
    } catch (e) {
      Alert.alert('Error', 'Delete failed: ' + e.message);
      return false;
    }
  }, []);

  const getPaymentStats = useCallback(() => {
    const todayPayments = payments.filter(p => isToday(p.date));
    const monthPayments = payments.filter(p => isThisMonth(p.date));
    const totalPending = members.reduce((sum, m) => sum + (m.dueAmount || 0), 0);
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      todayCollection: todayPayments.reduce((s, p) => s + p.amount, 0),
      monthCollection: monthPayments.reduce((s, p) => s + p.amount, 0),
      totalPending,
      totalRevenue,
    };
  }, [payments, members]);

  // ============= ENQUIRY FUNCTIONS =============
  const addEnquiry = useCallback(async (enquiryData) => {
    const newRef = push(ref(db, P.ENQUIRIES));
    const enquiry = {
      id: newRef.key,
      name: enquiryData.name,
      phone: enquiryData.phone,
      interest: enquiryData.interest || 'Gym',
      source: enquiryData.source || 'Walk-in',
      notes: enquiryData.notes || '',
      status: 'new',
      createdAt: new Date().toISOString(),
      followUpDate: addDays(formatDate(new Date()), 3),
    };
    await set(newRef, enquiry);
    return enquiry;
  }, []);

  const updateEnquiry = useCallback(async (enquiryId, updates) => {
    await update(ref(db, `${P.ENQUIRIES}/${enquiryId}`), updates);
  }, []);

  const deleteEnquiry = useCallback(async (enquiryId) => {
    await remove(ref(db, `${P.ENQUIRIES}/${enquiryId}`));
  }, []);

  // ============= NOTIFICATION FUNCTIONS =============
  const addNotification = useCallback(async (notifData) => {
    const newRef = push(ref(db, P.NOTIFICATIONS));
    await set(newRef, {
      id: newRef.key,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      memberId: notifData.memberId || '',
      memberName: notifData.memberName || '',
      memberPhone: notifData.memberPhone || '',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const markNotifRead = useCallback(async (notifId) => {
    await update(ref(db, `${P.NOTIFICATIONS}/${notifId}`), { read: true });
  }, []);

  const markAllRead = useCallback(async () => {
    const batchUpdates = {};
    notificationsR.current.forEach(n => {
      if (!n.read) batchUpdates[`${P.NOTIFICATIONS}/${n.id}/read`] = true;
    });
    if (Object.keys(batchUpdates).length > 0) {
      await update(ref(db), batchUpdates);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    await remove(ref(db, P.NOTIFICATIONS));
  }, []);

  const deleteNotification = useCallback(async (notifId) => {
    await remove(ref(db, `${P.NOTIFICATIONS}/${notifId}`));
  }, []);

  const generateAutoNotifications = useCallback(async () => {
    const today = formatDate(new Date());
    const currentMembers = membersR.current;
    const currentNotifs = notificationsR.current;
    const currentSettings = settingsR.current;
    const newNotifs = [];

    for (const member of currentMembers) {
      // Birthday notifications
      if (currentSettings.birthdayWish && member.dob) {
        const todayMD = today.slice(5);
        const dobMD = member.dob.slice(5);
        if (todayMD === dobMD) {
          const exists = currentNotifs.find(n => n.type === 'birthday' && n.memberId === member.id && isToday(n.createdAt));
          if (!exists) {
            newNotifs.push({ type: 'birthday', title: '🎂 Birthday Today!', message: `${member.name} has birthday today. Send wishes!`, memberId: member.id, memberName: member.name, memberPhone: member.phone });
          }
        }
      }

      // Expiry notifications
      if (currentSettings.expiryReminder && member.endDate) {
        const daysLeft = daysBetween(today, member.endDate);
        if (daysLeft >= 0 && daysLeft <= (currentSettings.expiryAlertDays || 7)) {
          const exists = currentNotifs.find(n => n.type === 'expiry' && n.memberId === member.id && isToday(n.createdAt));
          if (!exists) {
            newNotifs.push({ type: 'expiry', title: '⏰ Membership Expiring', message: `${member.name}'s plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${member.endDate})`, memberId: member.id, memberName: member.name, memberPhone: member.phone });
          }
        }
        if (daysLeft < 0) {
          const exists = currentNotifs.find(n => n.type === 'expiry' && n.memberId === member.id && n.message?.includes('expired') && isToday(n.createdAt));
          if (!exists) {
            newNotifs.push({ type: 'expiry', title: '❌ Membership Expired', message: `${member.name}'s plan expired on ${member.endDate}`, memberId: member.id, memberName: member.name, memberPhone: member.phone });
            if (member.status !== 'expired') {
              await update(ref(db, `${P.MEMBERS}/${member.id}`), { status: 'expired' });
            }
          }
        }
      }

      // Dues notifications
      if (currentSettings.duesReminder && (member.dueAmount || 0) > 0) {
        const exists = currentNotifs.find(n => n.type === 'dues' && n.memberId === member.id && isToday(n.createdAt));
        if (!exists) {
          newNotifs.push({ type: 'dues', title: '💰 Dues Pending', message: `${member.name} has ₹${member.dueAmount} pending`, memberId: member.id, memberName: member.name, memberPhone: member.phone });
        }
      }
    }

    // Write all new notifications to Firebase
    if (newNotifs.length > 0) {
      const batchUpdates = {};
      newNotifs.forEach(n => {
        const newRef = push(ref(db, P.NOTIFICATIONS));
        batchUpdates[`${P.NOTIFICATIONS}/${newRef.key}`] = {
          id: newRef.key, ...n, read: false, createdAt: new Date().toISOString(),
        };
      });
      await update(ref(db), batchUpdates);
    }
  }, []);

  // Generate notifications when members load
  useEffect(() => {
    if (!loading && members.length > 0) {
      generateAutoNotifications();
    }
  }, [loading, members.length]);

  // ============= PLANS FUNCTIONS =============
  const savePlans = useCallback(async (newPlans) => {
    const obj = {};
    newPlans.forEach(p => { obj[p.id] = p; });
    await set(ref(db, P.PLANS), obj);
  }, []);

  const addPlan = useCallback(async (planData) => {
    const newRef = push(ref(db, P.PLANS));
    const plan = { id: newRef.key, ...planData };
    await set(newRef, plan);
    return plan;
  }, []);

  const updatePlan = useCallback(async (planId, updates) => {
    await update(ref(db, `${P.PLANS}/${planId}`), updates);
  }, []);

  const deletePlan = useCallback(async (planId) => {
    await remove(ref(db, `${P.PLANS}/${planId}`));
  }, []);

  // ============= SETTINGS =============
  const saveSettings = useCallback(async (newSettings) => {
    await set(ref(db, P.SETTINGS), newSettings);
  }, []);

  // ============= WORKOUT & DIET =============
  const saveWorkoutPlans = useCallback(async (newPlans) => {
    const obj = {};
    newPlans.forEach(p => { obj[p.id] = p; });
    await set(ref(db, P.WORKOUT_PLANS), obj);
  }, []);

  const saveDietPlans = useCallback(async (newPlans) => {
    const obj = {};
    newPlans.forEach(p => { obj[p.id] = p; });
    await set(ref(db, P.DIET_PLANS), obj);
  }, []);

  // ============= MESSAGE TEMPLATES =============
  const saveMessageTemplates = useCallback(async (templates) => {
    await set(ref(db, P.MSG_TEMPLATES), templates);
  }, []);

  // ============= DASHBOARD STATS =============
  const getDashboardStats = useCallback(() => {
    const todayAttendance = getTodayAttendance();
    const paymentStats = getPaymentStats();
    const activeMembers = members.filter(m => getMemberStatus(m) === 'active').length;
    const expiredMembers = members.filter(m => getMemberStatus(m) === 'expired').length;
    const expiringMembers = members.filter(m => getMemberStatus(m) === 'expiring').length;
    const todayAdmissions = members.filter(m => isToday(m.createdAt)).length;
    const pendingDues = members.filter(m => (m.dueAmount || 0) > 0).length;

    return {
      totalMembers: members.length,
      activeMembers,
      expiredMembers,
      expiringMembers,
      todayCheckIns: todayAttendance.todayCheckIns,
      todayCheckOuts: todayAttendance.todayCheckOuts,
      currentlyInGym: todayAttendance.currentlyInGym,
      todayCollections: paymentStats.todayCollection,
      todayAdmissions,
      expiringSoon: expiringMembers,
      pendingDues,
      totalRevenue: paymentStats.totalRevenue,
      monthRevenue: paymentStats.monthCollection,
      totalPending: paymentStats.totalPending,
    };
  }, [members, getTodayAttendance, getPaymentStats, getMemberStatus]);

  // ============= BACKUP & RESTORE =============
  const backupData = useCallback(async () => {
    return {
      members, attendance, payments, enquiries, plans, settings,
      workoutPlans, dietPlans, messageTemplates, rollCounter,
      backupDate: new Date().toISOString(),
    };
  }, [members, attendance, payments, enquiries, plans, settings, workoutPlans, dietPlans, messageTemplates, rollCounter]);

  const restoreData = useCallback(async (data) => {
    try {
      const updates = {};
      if (data.members) {
        const obj = {};
        (Array.isArray(data.members) ? data.members : Object.values(data.members)).filter(Boolean).forEach(m => { obj[m.id] = m; });
        updates[P.MEMBERS] = obj;
      }
      if (data.attendance) {
        const obj = {};
        (Array.isArray(data.attendance) ? data.attendance : Object.values(data.attendance)).filter(Boolean).forEach(a => { obj[a.id] = a; });
        updates[P.ATTENDANCE] = obj;
      }
      if (data.payments) {
        const obj = {};
        (Array.isArray(data.payments) ? data.payments : Object.values(data.payments)).filter(Boolean).forEach(p => { obj[p.id] = p; });
        updates[P.PAYMENTS] = obj;
      }
      if (data.enquiries) {
        const obj = {};
        (Array.isArray(data.enquiries) ? data.enquiries : Object.values(data.enquiries)).filter(Boolean).forEach(e => { obj[e.id] = e; });
        updates[P.ENQUIRIES] = obj;
      }
      if (data.plans) {
        const obj = {};
        (Array.isArray(data.plans) ? data.plans : Object.values(data.plans)).filter(Boolean).forEach(p => { obj[p.id] = p; });
        updates[P.PLANS] = obj;
      }
      if (data.settings) updates[P.SETTINGS] = data.settings;
      if (data.workoutPlans) {
        const obj = {};
        (Array.isArray(data.workoutPlans) ? data.workoutPlans : Object.values(data.workoutPlans)).filter(Boolean).forEach(w => { obj[w.id] = w; });
        updates[P.WORKOUT_PLANS] = obj;
      }
      if (data.dietPlans) {
        const obj = {};
        (Array.isArray(data.dietPlans) ? data.dietPlans : Object.values(data.dietPlans)).filter(Boolean).forEach(d => { obj[d.id] = d; });
        updates[P.DIET_PLANS] = obj;
      }
      if (data.messageTemplates) updates[P.MSG_TEMPLATES] = data.messageTemplates;
      if (data.rollCounter) updates[P.ROLL_COUNTER] = data.rollCounter;

      await update(ref(db), updates);
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }, []);

  // ============= CONTEXT VALUE =============
  const value = {
    // State
    members, attendance, payments, enquiries, notifications, plans, settings,
    workoutPlans, dietPlans, messageTemplates, rollCounter, loading,
    // Member functions
    addMember, updateMember, deleteMember, renewMember, getMemberStatus,
    // Attendance
    checkIn, checkOut, getTodayAttendance,
    // Payments
    addPayment, collectDues, deletePayment, getPaymentStats,
    // Enquiries
    addEnquiry, updateEnquiry, deleteEnquiry,
    // Notifications
    addNotification, markNotifRead, markAllRead, clearAllNotifications, deleteNotification, generateAutoNotifications,
    // Plans
    addPlan, updatePlan, deletePlan, savePlans,
    // Settings
    saveSettings,
    // Workout & Diet
    saveWorkoutPlans, saveDietPlans,
    // Message Templates
    saveMessageTemplates,
    // Dashboard
    getDashboardStats,
    // Backup
    backupData, restoreData,
    // Helpers (exported for screens that need them)
    formatDate, addDays, daysBetween, isToday, isThisWeek, isThisMonth,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export default DataContext;
