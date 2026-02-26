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
      message: 'Check out SG Fitness 2.0 - Best Gym Management App! Download now.',
      title: 'SG Fitness 2.0',
    });
  } catch (e) {}
};

// ============= MESSAGE TEMPLATE HELPERS =============
const _fmtDate = (d) => {
  if (!d) return '';
  try {
    const clean = d.includes('T') ? d : d + 'T00:00:00';
    const dt = new Date(clean);
    if (isNaN(dt.getTime())) return d;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
  } catch { return d; }
};

export const fillTemplate = (template, data) => {
  if (!template) return '';
  return template
    .replace(/{name}/g, data.name || '')
    .replace(/{phone}/g, data.phone || '')
    .replace(/{plan}/g, data.plan || '')
    .replace(/{rollNo}/g, data.rollNo?.toString() || '')
    .replace(/{start_date}/g, _fmtDate(data.startDate) || '')
    .replace(/{expiry_date}/g, _fmtDate(data.endDate || data.expiryDate) || '')
    .replace(/{endDate}/g, _fmtDate(data.endDate || data.expiryDate) || '')
    .replace(/{due_amount}/g, data.dueAmount?.toString() || '0')
    .replace(/{amount}/g, data.dueAmount?.toString() || data.amount?.toString() || '0')
    .replace(/{gym_name}/g, data.gymName || 'SG Fitness 2.0')
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
  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(q) ||
    m.fatherName?.toLowerCase().includes(q) ||
    m.phone?.includes(q) ||
    m.rollNo?.toString().includes(q)
  );
  // Sort: exact match first, then startsWith, then contains
  const score = (m) => {
    if (m.rollNo?.toString() === q) return 0;
    if (m.name?.toLowerCase() === q) return 1;
    if (m.rollNo?.toString().startsWith(q)) return 2;
    if (m.name?.toLowerCase().startsWith(q)) return 3;
    if (m.phone?.startsWith(q)) return 4;
    return 5;
  };
  return filtered.sort((a, b) => score(a) - score(b));
};

// ============= BILL GENERATOR =============
export const generateBill = (member, payment, gymName, gymPhone) => {
  const fmtDate = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d.includes('T') ? d : d + 'T00:00:00');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
    } catch { return d; }
  };
  const gName = gymName || 'SG Fitness 2.0';
  const date = fmtDate(payment?.date || new Date().toISOString());
  return [
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🏋️  ${gName}`,
    gymPhone ? `📞 ${gymPhone}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 PAYMENT RECEIPT`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 Name      : ${member?.name || ''}`,
    `🔢 Roll No   : ${member?.rollNo || ''}`,
    `📱 Mobile    : ${member?.phone || ''}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📦 Plan      : ${payment?.plan || member?.plan || '-'}`,
    `💰 Amount    : ₹${payment?.amount || 0}`,
    `💳 Mode      : ${payment?.mode || 'Cash'}`,
    `📅 Date      : ${date}`,
    `✅ Status    : ${(payment?.status || 'Paid').toUpperCase()}`,
    member?.endDate ? `📆 Valid Till : ${fmtDate(member.endDate)}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🙏 Thank you for choosing`,
    `   ${gName}!`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
  ].filter(Boolean).join('\n');
};
export const validatePhone = (phone) => /^\d{10}$/.test(phone);
export const validateEmail = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
