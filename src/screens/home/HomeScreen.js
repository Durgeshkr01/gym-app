import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Card, Text, Searchbar, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { getDashboardStats, notifications, generateAutoNotifications } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});
  const c = theme.colors;

  useFocusEffect(useCallback(() => { loadData(); }, [getDashboardStats]));

  const loadData = () => setStats(getDashboardStats());

  const onRefresh = async () => {
    setRefreshing(true);
    await generateAutoNotifications();
    loadData();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const quickActions = [
    { icon: 'account-plus', label: 'Add\nMember', color: '#4CAF50', action: 'AddMember' },
    { icon: 'login', label: 'Check\nIn', color: '#2196F3', action: 'Attendance' },
    { icon: 'cash-multiple', label: 'Collect\nFee', color: '#FF6B35', action: 'Payments' },
    { icon: 'account-search', label: 'Find\nMember', color: '#9C27B0', action: 'Members' },
    { icon: 'account-question', label: 'New\nEnquiry', color: '#00BCD4', action: 'Enquiry' },
    { icon: 'bell', label: `Alerts\n(${unreadCount})`, color: '#F44336', action: 'Notifications' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}>
      
      {/* Header */}
      <Card style={[styles.headerCard, { backgroundColor: c.primary }]}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>SG Fitness Evolution</Text>
              <Text style={styles.headerSub}>Gym Admin Dashboard</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
              <MaterialCommunityIcons name="bell" size={26} color="#fff" />
              {unreadCount > 0 && <Badge style={styles.badge}>{unreadCount}</Badge>}
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Search */}
      <Searchbar placeholder="Search members by name, phone, roll no..." value={searchQuery}
        onChangeText={setSearchQuery} style={[styles.searchBar, { backgroundColor: c.surface }]}
        onSubmitEditing={() => navigation.navigate('Members', { search: searchQuery })} />

      {/* Quick Actions Grid */}
      <View style={styles.actionsGrid}>
        {quickActions.map((a, i) => (
          <TouchableOpacity key={i} style={[styles.actionBtn, { backgroundColor: c.surface }]}
            onPress={() => navigation.navigate(a.action)}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
              <MaterialCommunityIcons name={a.icon} size={26} color={a.color} />
            </View>
            <Text style={[styles.actionLabel, { color: c.text }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Summary */}
      <Text style={[styles.secTitle, { color: c.primary }]}>Today's Summary</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
        {[
          { l: 'Check-Ins', v: stats.todayCheckIns || 0, i: 'login', co: '#2196F3' },
          { l: 'In Gym', v: stats.currentlyInGym || 0, i: 'account-group', co: '#4CAF50' },
          { l: 'Collection', v: formatCurrency(stats.todayCollections || 0), i: 'cash', co: '#FF6B35' },
          { l: 'New Admits', v: stats.todayAdmissions || 0, i: 'account-plus', co: '#9C27B0' },
          { l: 'Check-Outs', v: stats.todayCheckOuts || 0, i: 'logout', co: '#FF5252' },
        ].map((s, i) => (
          <Card key={i} style={[styles.statCard, { backgroundColor: c.surface }]}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconBg, { backgroundColor: s.co + '18' }]}>
                <MaterialCommunityIcons name={s.i} size={22} color={s.co} />
              </View>
              <Text style={[styles.statVal, { color: c.text }]}>{s.v}</Text>
              <Text style={styles.statLbl}>{s.l}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Members Overview */}
      <Text style={[styles.secTitle, { color: c.primary }]}>Members Overview</Text>
      <View style={styles.overGrid}>
        {[
          { l: 'Total', v: stats.totalMembers || 0, i: 'account-group', co: '#2196F3' },
          { l: 'Active', v: stats.activeMembers || 0, i: 'check-circle', co: '#4CAF50' },
          { l: 'Expiring', v: stats.expiringSoon || 0, i: 'alert-circle', co: '#FF9800' },
          { l: 'Expired', v: stats.expiredMembers || 0, i: 'close-circle', co: '#FF5252' },
        ].map((s, i) => (
          <TouchableOpacity key={i} style={[styles.overCard, { backgroundColor: c.surface }]}
            onPress={() => navigation.navigate('Members')}>
            <MaterialCommunityIcons name={s.i} size={30} color={s.co} />
            <Text style={[styles.overNum, { color: c.text }]}>{s.v}</Text>
            <Text style={[styles.overLbl, { color: c.muted }]}>{s.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue */}
      <Text style={[styles.secTitle, { color: c.primary }]}>Revenue</Text>
      <View style={styles.revRow}>
        <Card style={[styles.revCard, { backgroundColor: c.surface }]}>
          <Card.Content style={styles.revInner}>
            <MaterialCommunityIcons name="cash-multiple" size={28} color="#4CAF50" />
            <Text style={[styles.revAmt, { color: '#4CAF50' }]}>{formatCurrency(stats.monthRevenue || 0)}</Text>
            <Text style={{ fontSize: 11, color: c.muted }}>This Month</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.revCard, { backgroundColor: c.surface }]}>
          <Card.Content style={styles.revInner}>
            <MaterialCommunityIcons name="cash-remove" size={28} color="#FF5252" />
            <Text style={[styles.revAmt, { color: '#FF5252' }]}>{formatCurrency(stats.totalPending || 0)}</Text>
            <Text style={{ fontSize: 11, color: c.muted }}>Pending Dues</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Links */}
      <Card style={[styles.linksCard, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.linksTitle, { color: c.text }]}>Management</Text>
          {[
            { i: 'account-group', l: 'Manage Members', s: 'Members', co: '#2196F3' },
            { i: 'cash-multiple', l: 'Payment History', s: 'Payments', co: '#4CAF50' },
            { i: 'account-question', l: 'Enquiry Management', s: 'Enquiry', co: '#9C27B0' },
            { i: 'cog', l: 'Plans & Settings', s: 'PlansSettings', co: '#FF9800' },
            { i: 'chart-bar', l: 'Reports & Analytics', s: 'Reports', co: '#3F51B5' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.linkItem} onPress={() => navigation.navigate(item.s)}>
              <MaterialCommunityIcons name={item.i} size={24} color={item.co} />
              <Text style={[styles.linkText, { color: c.text }]}>{item.l}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={c.muted} />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { margin: 15, marginBottom: 10, elevation: 4, borderRadius: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  bellBtn: { position: 'relative', padding: 8 },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FF5252', fontSize: 10 },
  searchBar: { marginHorizontal: 15, marginBottom: 15, elevation: 2, borderRadius: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginBottom: 10 },
  actionBtn: { width: (width - 50) / 3, margin: 5, paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 2 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 14 },
  secTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 15, marginTop: 15, marginBottom: 10 },
  hScroll: { paddingLeft: 15, marginBottom: 5 },
  statCard: { width: 130, marginRight: 10, elevation: 2, borderRadius: 10 },
  statContent: { alignItems: 'center', paddingVertical: 5 },
  statIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statVal: { fontSize: 20, fontWeight: 'bold' },
  statLbl: { fontSize: 10, color: '#999', marginTop: 2 },
  overGrid: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 5 },
  overCard: { flex: 1, margin: 5, paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 2 },
  overNum: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  overLbl: { fontSize: 10, marginTop: 2 },
  revRow: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 5 },
  revCard: { flex: 1, margin: 5, elevation: 2, borderRadius: 10 },
  revInner: { alignItems: 'center', paddingVertical: 8 },
  revAmt: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  linksCard: { margin: 15, elevation: 2, borderRadius: 12 },
  linksTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  linkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#E0E0E0' },
  linkText: { flex: 1, fontSize: 15, marginLeft: 12 },
});
