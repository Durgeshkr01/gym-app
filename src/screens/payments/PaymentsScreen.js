import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, Chip, FAB, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDisplayDate, formatTime } from '../../utils/helpers';

export default function PaymentsScreen({ navigation }) {
  const { theme } = useTheme();
  const { payments, getPaymentStats } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState({});
  const c = theme.colors;

  useFocusEffect(useCallback(() => {
    setStats(getPaymentStats());
  }, [payments, getPaymentStats]));

  const getFiltered = () => {
    let filtered = [...payments];
    if (selectedFilter === 'today') filtered = filtered.filter(p => {
      const d = new Date(p.date); const t = new Date();
      return d.toDateString() === t.toDateString();
    });
    else if (selectedFilter === 'week') filtered = filtered.filter(p => {
      const d = new Date(p.date); const w = new Date(Date.now() - 7 * 86400000);
      return d >= w;
    });
    else if (selectedFilter === 'month') filtered = filtered.filter(p => {
      const d = new Date(p.date); const t = new Date();
      return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    });
    else if (selectedFilter === 'pending') filtered = filtered.filter(p => p.status === 'partial');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.memberName?.toLowerCase().includes(q));
    }
    return filtered;
  };

  const renderPayment = ({ item }) => (
    <Card style={[styles.payCard, { backgroundColor: c.surface }]}>
      <Card.Content style={styles.payRow}>
        <View style={[styles.payIcon, { backgroundColor: item.status === 'paid' ? '#4CAF50' + '18' : '#FF9800' + '18' }]}>
          <MaterialCommunityIcons name={item.status === 'paid' ? 'cash-check' : 'cash-remove'}
            size={24} color={item.status === 'paid' ? '#4CAF50' : '#FF9800'} />
        </View>
        <View style={styles.payInfo}>
          <Text style={[styles.payName, { color: c.text }]}>{item.memberName}</Text>
          <Text style={{ fontSize: 12, color: c.muted }}>{item.type} • {item.plan}</Text>
          <Text style={{ fontSize: 11, color: c.muted }}>{formatDisplayDate(item.date)} {formatTime(item.date)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.payAmount, { color: '#4CAF50' }]}>₹{item.amount}</Text>
          <Chip mode="flat" style={{ backgroundColor: item.status === 'paid' ? '#4CAF50' + '18' : '#FF9800' + '18', height: 22 }}
            textStyle={{ fontSize: 10, color: item.status === 'paid' ? '#4CAF50' : '#FF9800' }}>
            {item.status === 'paid' ? 'Paid' : 'Partial'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        {[
          { l: 'Today', v: formatCurrency(stats.todayCollection || 0), co: '#4CAF50', i: 'cash' },
          { l: 'Month', v: formatCurrency(stats.monthCollection || 0), co: '#2196F3', i: 'cash-multiple' },
          { l: 'Pending', v: formatCurrency(stats.totalPending || 0), co: '#FF5252', i: 'cash-remove' },
          { l: 'Total', v: formatCurrency(stats.totalRevenue || 0), co: '#FF6B35', i: 'chart-line' },
        ].map((s, i) => (
          <Card key={i} style={[styles.statCard, { backgroundColor: s.co }]}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name={s.i} size={24} color="#fff" />
              <Text style={styles.statVal}>{s.v}</Text>
              <Text style={styles.statLbl}>{s.l}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Searchbar placeholder="Search by member name..." value={searchQuery} onChangeText={setSearchQuery}
        style={[styles.search, { backgroundColor: c.surface }]} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { id: 'all', l: 'All' }, { id: 'today', l: 'Today' }, { id: 'week', l: 'This Week' },
          { id: 'month', l: 'This Month' }, { id: 'pending', l: 'Partial' },
        ].map(f => (
          <Chip key={f.id} selected={selectedFilter === f.id} onPress={() => setSelectedFilter(f.id)}
            style={[styles.filterChip, selectedFilter === f.id && { backgroundColor: c.primary + '20' }]}
            textStyle={{ fontSize: 12, color: selectedFilter === f.id ? c.primary : c.muted }}>{f.l}</Chip>
        ))}
      </ScrollView>

      <FlatList data={getFiltered()} renderItem={renderPayment} keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cash" size={50} color={c.muted} />
            <Text style={{ color: c.muted, marginTop: 10 }}>No payment records</Text>
          </View>
        } />

      <FAB icon="cash-plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff"
        onPress={() => navigation.navigate('Members')} label="Collect" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsScroll: { paddingLeft: 15, paddingVertical: 15 },
  statCard: { width: 120, marginRight: 10, elevation: 3, borderRadius: 12 },
  statContent: { alignItems: 'center', paddingVertical: 10 },
  statVal: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  statLbl: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  search: { marginHorizontal: 15, marginBottom: 8, elevation: 2, borderRadius: 10 },
  filterRow: { paddingHorizontal: 15, marginBottom: 10, maxHeight: 40 },
  filterChip: { marginRight: 8, height: 32 },
  payCard: { marginHorizontal: 15, marginVertical: 3, elevation: 1, borderRadius: 10 },
  payRow: { flexDirection: 'row', alignItems: 'center' },
  payIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  payInfo: { flex: 1, marginLeft: 12 },
  payName: { fontSize: 15, fontWeight: '600' },
  payAmount: { fontSize: 18, fontWeight: 'bold' },
  empty: { alignItems: 'center', paddingTop: 60 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
