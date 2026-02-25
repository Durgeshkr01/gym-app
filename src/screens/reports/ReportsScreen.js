import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, SegmentedButtons, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrencyFull, formatCurrency } from '../../utils/helpers';

export default function ReportsScreen({ navigation }) {
  const { theme } = useTheme();
  const { getDashboardStats, getPaymentStats, members, payments, attendance, getMemberStatus } = useData();
  const c = theme.colors;
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [payStats, setPayStats] = useState({});

  useFocusEffect(useCallback(() => {
    setStats(getDashboardStats());
    setPayStats(getPaymentStats());
  }, [members, payments]));

  const getPlanDistribution = () => {
    const dist = {};
    members.forEach(m => { dist[m.plan || 'Unknown'] = (dist[m.plan || 'Unknown'] || 0) + 1; });
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  };

  const getMonthlyRevenue = () => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      months[key] = 0;
    }
    payments.forEach(p => {
      const d = new Date(p.date);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (months[key] !== undefined) months[key] += (p.amount || 0);
    });
    return Object.entries(months);
  };

  const getAttendanceStats = () => {
    const last7 = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const count = attendance.filter(a => a.date === dayStr && a.type === 'in').length;
      last7.push({ day: d.toLocaleString('default', { weekday: 'short' }), count });
    }
    return last7;
  };

  const getStatusBreakdown = () => {
    let active = 0, expiring = 0, expired = 0;
    members.forEach(m => {
      const s = getMemberStatus(m);
      if (s === 'active') active++;
      else if (s === 'expiring') expiring++;
      else expired++;
    });
    return { active, expiring, expired };
  };

  const getGenderBreakdown = () => {
    let male = 0, female = 0, other = 0;
    members.forEach(m => {
      if (m.gender === 'Male') male++;
      else if (m.gender === 'Female') female++;
      else other++;
    });
    return { male, female, other };
  };

  const maxVal = (arr) => Math.max(...arr.map(a => a[1] || a.count || 0), 1);

  const BarChart = ({ data, color, valueKey = 1, labelKey = 0, suffix = '' }) => {
    const max = Math.max(...data.map(d => (Array.isArray(d) ? d[valueKey] : d.count) || 0), 1);
    return (
      <View style={styles.chartContainer}>
        {data.map((item, i) => {
          const val = Array.isArray(item) ? item[valueKey] : item.count;
          const label = Array.isArray(item) ? item[labelKey] : item.day;
          const h = Math.max((val / max) * 100, 2);
          return (
            <View key={i} style={styles.barCol}>
              <Text style={{ fontSize: 9, color: c.text, fontWeight: '600' }}>{val}{suffix}</Text>
              <View style={[styles.bar, { height: h, backgroundColor: color || c.primary }]} />
              <Text style={{ fontSize: 9, color: c.muted }} numberOfLines={1}>{label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const StatCard = ({ icon, label, value, color: cardColor, prefix = '' }) => (
    <View style={styles.statBoxWrapper}>
      <View style={[styles.statBox, { backgroundColor: (cardColor || c.primary) + '12' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={cardColor || c.primary} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: cardColor || c.primary, marginTop: 4 }}>{prefix}{value}</Text>
        <Text style={{ fontSize: 10, color: c.muted }}>{label}</Text>
      </View>
    </View>
  );

  const renderOverview = () => {
    const sb = getStatusBreakdown();
    const gb = getGenderBreakdown();
    return (
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Text style={[styles.secTitle, { color: c.text }]}>Member Overview</Text>
        <View style={styles.statGrid}>
          <StatCard icon="account-group" label="Total" value={stats.totalMembers || 0} color="#2196F3" />
          <StatCard icon="account-check" label="Active" value={sb.active} color="#4CAF50" />
          <StatCard icon="clock-alert" label="Expiring" value={sb.expiring} color="#FF9800" />
          <StatCard icon="account-off" label="Expired" value={sb.expired} color="#FF5252" />
        </View>

        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: c.text }]}>Gender Distribution</Text>
            <View style={styles.progressRow}>
              {[{ l: 'Male', v: gb.male, col: '#2196F3' }, { l: 'Female', v: gb.female, col: '#E91E63' }, { l: 'Other', v: gb.other, col: '#9C27B0' }].map(g => (
                <View key={g.l} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={[styles.circStat, { borderColor: g.col }]}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: g.col }}>{g.v}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{g.l}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: c.text }]}>Plan Distribution</Text>
            {getPlanDistribution().map(([plan, count]) => (
              <View key={plan} style={styles.planRow}>
                <Text style={{ flex: 1, fontSize: 13, color: c.text }}>{plan}</Text>
                <View style={[styles.planBar, { width: `${Math.max((count / members.length) * 100, 5)}%`, backgroundColor: 'rgba(255,107,53,0.2)' }]} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: c.primary, minWidth: 30, textAlign: 'right' }}>{count}</Text>
              </View>
            ))}
            {members.length === 0 && <Text style={{ color: c.muted, textAlign: 'center', paddingVertical: 20 }}>No data</Text>}
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const renderRevenue = () => {
    const monthData = getMonthlyRevenue();
    return (
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Text style={[styles.secTitle, { color: c.text }]}>Revenue Summary</Text>
        <View style={styles.statGrid}>
          <StatCard icon="cash" label="Today" value={formatCurrency(payStats.todayTotal || 0)} color="#4CAF50" prefix="₹" />
          <StatCard icon="calendar-month" label="This Month" value={formatCurrency(payStats.monthTotal || 0)} color="#2196F3" prefix="₹" />
          <StatCard icon="cash-remove" label="Pending" value={formatCurrency(payStats.pendingTotal || 0)} color="#FF5252" prefix="₹" />
          <StatCard icon="chart-line" label="Total" value={formatCurrency(payStats.totalCollected || 0)} color="#9C27B0" prefix="₹" />
        </View>

        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: c.text }]}>Monthly Revenue (Last 6 Months)</Text>
            <BarChart data={monthData} color="#4CAF50" />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: c.text }]}>Collection Breakdown</Text>
            <View style={styles.breakdownRow}>
              <View style={[styles.bItem, { backgroundColor: '#4CAF5012' }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>{payments.filter(p => p.status === 'paid').length}</Text>
                <Text style={{ fontSize: 10, color: c.muted }}>Full Paid</Text>
              </View>
              <View style={[styles.bItem, { backgroundColor: '#FF980012' }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF9800' }}>{payments.filter(p => p.status === 'partial').length}</Text>
                <Text style={{ fontSize: 10, color: c.muted }}>Partial</Text>
              </View>
              <View style={[styles.bItem, { backgroundColor: '#FF525212' }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF5252' }}>{payments.filter(p => p.status === 'pending').length}</Text>
                <Text style={{ fontSize: 10, color: c.muted }}>Pending</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const renderAttendance = () => {
    const last7 = getAttendanceStats();
    const todayCount = last7[last7.length - 1]?.count || 0;
    const avgCount = Math.round(last7.reduce((s, d) => s + d.count, 0) / 7);
    return (
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Text style={[styles.secTitle, { color: c.text }]}>Attendance Analytics</Text>
        <View style={styles.statGrid}>
          <StatCard icon="login" label="Today" value={todayCount} color="#4CAF50" />
          <StatCard icon="chart-bar" label="Avg/Day" value={avgCount} color="#2196F3" />
          <StatCard icon="calendar-week" label="This Week" value={last7.reduce((s, d) => s + d.count, 0)} color="#9C27B0" />
          <StatCard icon="percent" label="Active %" value={members.length ? Math.round((stats.activeMembers || 0) / members.length * 100) : 0} color="#FF9800" />
        </View>

        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: c.text }]}>Last 7 Days Check-ins</Text>
            <BarChart data={last7} color="#2196F3" />
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SegmentedButtons value={tab} onValueChange={setTab}
        buttons={[
          { value: 'overview', label: 'Overview', icon: 'chart-pie' },
          { value: 'revenue', label: 'Revenue', icon: 'cash' },
          { value: 'attendance', label: 'Attendance', icon: 'chart-bar' },
        ]}
        style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 5 }} />
      {tab === 'overview' && renderOverview()}
      {tab === 'revenue' && renderRevenue()}
      {tab === 'attendance' && renderAttendance()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  secTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  statBoxWrapper: { width: '50%', padding: 4 },
  statBox: { padding: 12, borderRadius: 10, alignItems: 'center' },
  card: { marginBottom: 12, borderRadius: 10, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 130, paddingTop: 10 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 20, borderRadius: 4, marginVertical: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  circStat: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, borderColor: '#E0E0E0' },
  planBar: { height: 6, borderRadius: 3, marginHorizontal: 10 },
  breakdownRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  bItem: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
});
