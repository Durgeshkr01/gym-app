import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Card, Text, Chip, Button, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, makeCall, sendSMS, formatDisplayDate, fillTemplate } from '../../utils/helpers';

export default function NotificationsScreen({ navigation }) {
  const { theme } = useTheme();
  const { notifications, members, messageTemplates,
    generateAutoNotifications, markNotifRead, markAllRead,
    clearAllNotifications, deleteNotification, collectDues } = useData();
  const c = theme.colors;
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    generateAutoNotifications();
  }, [members]));

  const onRefresh = async () => {
    setRefreshing(true);
    await generateAutoNotifications();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getFiltered = () => {
    let list = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filter === 'unread') return list.filter(n => !n.read);
    if (filter !== 'all') return list.filter(n => n.type === filter);
    return list;
  };

  const typeConfig = {
    birthday: { icon: 'cake-variant', color: '#E91E63', label: 'Birthday', bg: '#FCE4EC' },
    expiry:   { icon: 'clock-alert-outline', color: '#FF9800', label: 'Expiry', bg: '#FFF3E0' },
    dues:     { icon: 'cash-remove', color: '#F44336', label: 'Dues', bg: '#FFEBEE' },
    welcome:  { icon: 'hand-wave', color: '#4CAF50', label: 'Welcome', bg: '#E8F5E9' },
    renewal:  { icon: 'refresh', color: '#2196F3', label: 'Renewal', bg: '#E3F2FD' },
    general:  { icon: 'bell', color: '#9C27B0', label: 'General', bg: '#F3E5F5' },
    checkin:  { icon: 'login', color: '#009688', label: 'Check-in', bg: '#E0F2F1' },
    inactive: { icon: 'account-off', color: '#795548', label: 'Inactive', bg: '#EFEBE9' },
  };

  // Build WhatsApp message for any notification type
  const getWhatsAppMsg = (type, member) => {
    const tpl = messageTemplates[type];
    const whatsappTpl = tpl?.whatsapp || tpl || '';
    if (!whatsappTpl) return `Hi ${member.name}, message from SG Fitness Evolution.`;
    return fillTemplate(whatsappTpl, {
      name: member.name, phone: member.phone, plan: member.plan,
      startDate: member.startDate, endDate: member.endDate, expiryDate: member.endDate,
      dueAmount: member.dueAmount, gymName: 'SG Fitness Evolution',
    });
  };

  // Build SMS message for any notification type
  const getSmsMsg = (type, member) => {
    const tpl = messageTemplates[type];
    const smsTpl = tpl?.sms || '';
    if (!smsTpl) return `Hi ${member.name}, message from SG Fitness Evolution.`;
    return fillTemplate(smsTpl, {
      name: member.name, phone: member.phone, plan: member.plan,
      startDate: member.startDate, endDate: member.endDate, expiryDate: member.endDate,
      dueAmount: member.dueAmount, gymName: 'SG Fitness Evolution',
    });
  };

  // Send WhatsApp for any notification
  const handleWhatsApp = (notif) => {
    const member = members.find(m => m.id === notif.memberId);
    if (!member?.phone) { Alert.alert('Error', 'Member phone not available'); return; }
    const msg = getWhatsAppMsg(notif.type, member);
    openWhatsApp(member.phone, msg);
    markNotifRead(notif.id);
  };

  // Send SMS for any notification
  const handleSMS = (notif) => {
    const member = members.find(m => m.id === notif.memberId);
    if (!member?.phone) { Alert.alert('Error', 'Member phone not available'); return; }
    const msg = getSmsMsg(notif.type, member);
    sendSMS(member.phone, msg);
    markNotifRead(notif.id);
  };

  // Main action handler with WhatsApp + SMS options for all types
  const handleAction = (notif) => {
    const member = members.find(m => m.id === notif.memberId);
    if (!member) {
      markNotifRead(notif.id);
      return;
    }

    const cfg = typeConfig[notif.type] || typeConfig.general;
    const buttons = [{ text: 'Cancel', style: 'cancel' }];

    // Type-specific extra actions
    if (notif.type === 'dues' && member.dueAmount > 0) {
      buttons.push({
        text: '✅ Collect Full Dues',
        onPress: async () => {
          await collectDues(member.id, member.dueAmount);
          markNotifRead(notif.id);
          Alert.alert('Done', `₹${member.dueAmount} collected from ${member.name}`);
        },
      });
    }

    if (notif.type === 'expiry' || notif.type === 'renewal') {
      buttons.push({
        text: '👤 View Member',
        onPress: () => {
          markNotifRead(notif.id);
          navigation.navigate('MemberDetail', { memberId: member.id });
        },
      });
    }

    // WhatsApp option - always available
    if (member.phone) {
      buttons.push({
        text: '📱 WhatsApp Message',
        onPress: () => handleWhatsApp(notif),
      });
      buttons.push({
        text: '💬 Send SMS',
        onPress: () => handleSMS(notif),
      });
    }

    // Call option
    if (member.phone) {
      buttons.push({
        text: '📞 Call',
        onPress: () => { makeCall(member.phone); markNotifRead(notif.id); },
      });
    }

    const title = cfg.label + ' - ' + member.name;
    let msg = notif.message || '';
    if (notif.type === 'dues') msg += `\nDues: ₹${member.dueAmount || 0}`;

    Alert.alert(title, msg, buttons);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Delete all notifications?', [
      { text: 'Cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => clearAllNotifications() },
    ]);
  };

  const getActionLabel = (type) => {
    if (type === 'birthday') return 'Send Wish 🎂';
    if (type === 'expiry') return 'Remind';
    if (type === 'dues') return 'Collect';
    if (type === 'welcome') return 'Welcome';
    if (type === 'renewal') return 'View';
    if (type === 'checkin') return 'View';
    if (type === 'inactive') return 'Reach Out';
    return 'Action';
  };

  const renderNotif = ({ item }) => {
    const cfg = typeConfig[item.type] || typeConfig.general;
    const member = members.find(m => m.id === item.memberId);
    const timeDiff = getRelativeTime(item.createdAt);

    return (
      <TouchableOpacity onPress={() => handleAction(item)} activeOpacity={0.7}>
        <Card style={[styles.card, { backgroundColor: item.read ? c.surface : cfg.bg, borderLeftColor: cfg.color, borderLeftWidth: 3 }]}>
          <Card.Content>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: cfg.color + '20' }]}>
                <MaterialCommunityIcons name={cfg.icon} size={22} color={cfg.color} />
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>{item.title}</Text>
                  {!item.read && <Badge size={8} style={{ backgroundColor: cfg.color, marginLeft: 5 }} />}
                </View>
                <Text style={{ fontSize: 12, color: c.muted, marginTop: 2 }} numberOfLines={2}>{item.message}</Text>
                <View style={[styles.bottomRow, { marginTop: 6 }]}>
                  <Chip mode="flat" style={{ height: 22, backgroundColor: cfg.color + '15' }}
                    textStyle={{ fontSize: 9, color: cfg.color }}>{cfg.label}</Chip>
                  <Text style={{ fontSize: 10, color: c.muted }}>{timeDiff}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteNotification(item.id)} style={{ padding: 5 }}>
                <MaterialCommunityIcons name="close" size={16} color={c.muted} />
              </TouchableOpacity>
            </View>

            {/* Action buttons row - WhatsApp + SMS + Call + Type Action for EVERY notification */}
            {member && (
              <View style={styles.actionRow}>
                <Button compact mode="contained" onPress={() => handleAction(item)}
                  style={{ backgroundColor: cfg.color, flex: 1 }}
                  labelStyle={{ fontSize: 11, color: '#fff' }}>{getActionLabel(item.type)}</Button>
                {member.phone ? (
                  <>
                    <TouchableOpacity style={[styles.smallBtn, { borderColor: '#25D366' }]}
                      onPress={() => handleWhatsApp(item)}>
                      <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { borderColor: '#FF9800' }]}
                      onPress={() => handleSMS(item)}>
                      <MaterialCommunityIcons name="message-text" size={18} color="#FF9800" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { borderColor: '#2196F3' }]}
                      onPress={() => { makeCall(member.phone); markNotifRead(item.id); }}>
                      <MaterialCommunityIcons name="phone" size={18} color="#2196F3" />
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const filterChips = [
    { id: 'all', label: `All (${notifications.length})` },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'birthday', label: '🎂 Birthday' },
    { id: 'expiry', label: '⏰ Expiry' },
    { id: 'dues', label: '💰 Dues' },
    { id: 'welcome', label: '👋 Welcome' },
    { id: 'renewal', label: '🔄 Renewal' },
    { id: 'inactive', label: '😴 Inactive' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header stats */}
      <View style={[styles.headerBar, { backgroundColor: c.primary }]}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>{notifications.length}</Text>
            <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>{unreadCount}</Text>
            <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Unread</Text>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>
              {notifications.filter(n => n.type === 'birthday').length}
            </Text>
            <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Birthdays</Text>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>
              {notifications.filter(n => n.type === 'expiry').length}
            </Text>
            <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Expiring</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8, gap: 10 }}>
          <Button compact mode="contained" icon="check-all" onPress={() => markAllRead()}
            style={{ backgroundColor: '#ffffff30' }} labelStyle={{ color: '#fff', fontSize: 11 }}>Mark All Read</Button>
          <Button compact mode="contained" icon="delete-sweep" onPress={handleClearAll}
            style={{ backgroundColor: '#ffffff30' }} labelStyle={{ color: '#fff', fontSize: 11 }}>Clear All</Button>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filterChips.map(f => (
          <Chip key={f.id} selected={filter === f.id} onPress={() => setFilter(f.id)}
            style={[styles.fChip, filter === f.id && { backgroundColor: 'rgba(255,107,53,0.15)' }]}
            textStyle={{ fontSize: 11, color: filter === f.id ? c.primary : c.muted }}>{f.label}</Chip>
        ))}
      </View>

      {/* Notification list */}
      <FlatList
        data={getFiltered()}
        renderItem={renderNotif}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-check" size={50} color={c.muted} />
            <Text style={{ color: c.muted, marginTop: 10 }}>No notifications</Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>Pull down to check for new alerts</Text>
          </View>
        }
      />
    </View>
  );
}

function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDisplayDate(dateStr);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { padding: 12, paddingTop: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, flexWrap: 'wrap' },
  fChip: { marginRight: 6, marginBottom: 4, height: 30 },
  card: { marginHorizontal: 12, marginVertical: 4, elevation: 1, borderRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '600', flex: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderColor: '#E0E0E0', gap: 6 },
  smallBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
});
