import { Linking, Alert, Share } from 'react-native';

// ============= COMMUNICATION HELPERS =============
export const openWhatsApp = (phone, message = '') => {
  if (!phone) { Alert.alert('Error', 'Phone number not available'); return; }
  const cleaned = phone.replace(/\D/g, '');
  const num = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  const url = message
    ? `whatsapp://send?phone=${num}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?phone=${num}`;
  Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp not installed'));
};

export const makeCall = (phone) => {
  if (!phone) { Alert.alert('Error', 'Phone number not available'); return; }
  Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Cannot make call'));
};

export const sendSMS = (phone, message = '') => {
  if (!phone) { Alert.alert('Error', 'Phone number not available'); return; }
  const url = message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
  Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot send SMS'));
};

export const shareApp = async () => {
  try {
    await Share.share({
      message: 'Check out SG Fitness Evolution - Best Gym Management App! Download now.',
      title: 'SG Fitness Evolution',
    });
  } catch (e) {}
};

// ============= MESSAGE TEMPLATE HELPERS =============
export const fillTemplate = (template, data) => {
  if (!template) return '';
  return template
    .replace(/{name}/g, data.name || '')
    .replace(/{phone}/g, data.phone || '')
    .replace(/{plan}/g, data.plan || '')
    .replace(/{rollNo}/g, data.rollNo?.toString() || '')
    .replace(/{start_date}/g, data.startDate || '')
    .replace(/{expiry_date}/g, data.endDate || data.expiryDate || '')
    .replace(/{endDate}/g, data.endDate || data.expiryDate || '')
    .replace(/{due_amount}/g, data.dueAmount?.toString() || '0')
    .replace(/{amount}/g, data.dueAmount?.toString() || data.amount?.toString() || '0')
    .replace(/{gym_name}/g, data.gymName || 'SG Fitness Evolution')
    .replace(/{gym_phone}/g, data.gymPhone || '');
};

// ============= DATE HELPERS =============
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return `${formatDisplayDate(dateStr)} ${formatTime(dateStr)}`;
};

export const calculateAge = (dobStr) => {
  if (!dobStr) return '';
  const parts = dobStr.split('-');
  if (parts.length !== 3) return '';
  const dob = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age > 0 ? `${age} years` : '';
};

// ============= FORMATTING HELPERS =============
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

export const formatCurrencyFull = (amount) => {
  const num = parseFloat(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

// ============= STATUS HELPERS =============
export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#4CAF50';
    case 'expired': return '#FF5252';
    case 'expiring': return '#FF9800';
    default: return '#9E9E9E';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'active': return 'Active';
    case 'expired': return 'Expired';
    case 'expiring': return 'Expiring Soon';
    default: return 'Unknown';
  }
};

// ============= SEARCH HELPERS =============
export const searchMembers = (members, query) => {
  if (!query.trim()) return members;
  const q = query.toLowerCase().trim();
  return members.filter(m =>
    m.name?.toLowerCase().includes(q) ||
    m.fatherName?.toLowerCase().includes(q) ||
    m.phone?.includes(q) ||
    m.rollNo?.toString().includes(q)
  );
};

// ============= VALIDATION =============
export const validatePhone = (phone) => /^\d{10}$/.test(phone);
export const validateEmail = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
