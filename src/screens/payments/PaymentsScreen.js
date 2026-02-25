import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { Card, Text, Searchbar, Chip, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDisplayDate, formatTime } from '../../utils/helpers';

export default function PaymentsScreen({ navigation }) {
  const { theme } = useTheme();
  const { payments, getPaymentStats, deletePayment } = useData();
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

  const handleDeletePayment = (item) => {
    if (!item || !item.id) {
      Alert.alert('Debug', 'Item: ' + JSON.stringify(item ? { id: item.id, keys: Object.keys(item) } : 'null'));
      return;
    }
    Alert.alert(
      'Delete Payment',
      `Delete ₹${item.amount} payment of ${item.memberName}?\n\nID: ${item.id}`,
      [
        { text: 'Cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            Alert.alert('Deleting...', 'Payment ID: ' + item.id);
            const result = await deletePayment(item.id);
            if (result !== false) {
              Alert.alert('Deleted', 'Payment record deleted successfully');
            }
          } catch (e) {
            Alert.alert('Error', 'Delete failed: ' + e.message);
          }
        }},
      ]
    );
  };

  const renderPayment = ({ item }) => {
    const isPaid = item.status === 'paid';
    const chipBg = isPaid ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)';
    const chipColor = isPaid ? '#4CAF50' : '#FF9800';

    return (
      <Card style={[styles.payCard, { backgroundColor: c.surface }]}>
        <Card.Content>
          <View style={styles.payRow}>
            <View style={[styles.payIcon, { backgroundColor: chipBg }]}>
              <MaterialCommunityIcons name={isPaid ? 'cash-check' : 'cash-remove'}
                size={24} color={chipColor} />
            </View>
            <View style={styles.payInfo}>
              <Text style={[styles.payName, { color: c.text }]}>{item.memberName}</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>{item.type} • {item.plan}</Text>
              <Text style={{ fontSize: 11, color: c.muted }}>{formatDisplayDate(item.date)} {formatTime(item.date)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.payAmount, { color: '#4CAF50' }]}>₹{item.amount}</Text>
              <Chip mode="flat" style={{ backgroundColor: chipBg, height: 22, marginTop: 2 }}
                textStyle={{ fontSize: 10, color: chipColor }}>
                {isPaid ? 'Paid' : 'Partial'}
              </Chip>
            </View>
          </View>
          {/* Delete Button - Full width */}
          <Button
            mode="contained"
            icon="delete"
            onPress={() => handleDeletePayment(item)}
            buttonColor="#F44336"
            textColor="#fff"
            style={{ marginTop: 10, borderRadius: 8 }}
            labelStyle={{ fontSize: 12, fontWeight: '700' }}>
            Delete Payment
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList data={getFiltered()} renderItem={renderPayment} keyExtractor={(item, idx) => item.id || String(idx)}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { l: 'Today', v: formatCurrency(stats.todayCollection || 0), co: '#4CAF50', i: 'cash' },
                { l: 'Month', v: formatCurrency(stats.monthCollection || 0), co: '#2196F3', i: 'cash-multiple' },
                { l: 'Pending', v: formatCurrency(stats.totalPending || 0), co: '#FF5252', i: 'cash-remove' },
                { l: 'Total', v: formatCurrency(stats.totalRevenue || 0), co: '#FF6B35', i: 'chart-line' },
              ].map((s, i) => (
                <View key={i} style={styles.statCardWrapper}>
                  <Card style={[styles.statCard, { backgroundColor: s.co }]}>
                    <Card.Content style={styles.statContent}>
                      <MaterialCommunityIcons name={s.i} size={22} color="#fff" />
                      <Text style={styles.statVal}>{s.v}</Text>
                      <Text style={styles.statLbl}>{s.l}</Text>
                    </Card.Content>
                  </Card>
                </View>
              ))}
            </View>

            <Searchbar placeholder="Search by member name..." value={searchQuery} onChangeText={setSearchQuery}
              style={[styles.search, { backgroundColor: c.surface }]} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}
              contentContainerStyle={{ alignItems: 'center', paddingVertical: 4 }}>
              {[
                { id: 'all', l: 'All' }, { id: 'today', l: 'Today' }, { id: 'week', l: 'This Week' },
                { id: 'month', l: 'This Month' }, { id: 'pending', l: 'Partial' },
              ].map(f => {
                const isSelected = selectedFilter === f.id;
                return (
                  <Chip key={f.id} selected={isSelected} onPress={() => setSelectedFilter(f.id)}
                    style={[styles.filterChip, isSelected && { backgroundColor: 'rgba(255,107,53,0.15)' }]}
                    textStyle={{ fontSize: 12, color: isSelected ? c.primary : c.muted }}>{f.l}</Chip>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cash" size={50} color={c.muted} />
            <Text style={{ color: c.muted, marginTop: 10 }}>No payment records</Text>
          </View>
        } />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 4 },
  statCardWrapper: { width: '50%', padding: 4 },
  statCard: { elevation: 3, borderRadius: 12 },
  statContent: { alignItems: 'center', paddingVertical: 10 },
  statVal: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  statLbl: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  search: { marginHorizontal: 12, marginBottom: 8, elevation: 2, borderRadius: 10 },
  filterRow: { paddingHorizontal: 12, marginBottom: 10 },
  filterChip: { marginRight: 8, height: 36 },
  payCard: { marginHorizontal: 12, marginVertical: 4, elevation: 2, borderRadius: 10 },
  payRow: { flexDirection: 'row', alignItems: 'center' },
  payIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  payInfo: { flex: 1, marginLeft: 12 },
  payName: { fontSize: 15, fontWeight: '600' },
  payAmount: { fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F44336', paddingVertical: 8, borderRadius: 8, marginTop: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
