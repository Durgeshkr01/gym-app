import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Searchbar, FAB, Chip, Avatar, Card, Menu, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, makeCall, searchMembers, getStatusColor, getStatusLabel, formatDisplayDate } from '../../utils/helpers';

export default function MembersScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { members, getMemberStatus, deleteMember, checkIn, checkOut, attendance } = useData();
  const [searchQuery, setSearchQuery] = useState(route?.params?.search || '');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const c = theme.colors;

  useFocusEffect(useCallback(() => {
    if (route?.params?.search) setSearchQuery(route.params.search);
  }, [route?.params?.search]));

  const getFilteredMembers = () => {
    let filtered = [...members];
    // Apply status filter
    if (selectedFilter === 'active') filtered = filtered.filter(m => getMemberStatus(m) === 'active' || getMemberStatus(m) === 'expiring');
    else if (selectedFilter === 'expired') filtered = filtered.filter(m => getMemberStatus(m) === 'expired');
    else if (selectedFilter === 'expiring') filtered = filtered.filter(m => getMemberStatus(m) === 'expiring');
    else if (selectedFilter === 'dues') filtered = filtered.filter(m => (m.dueAmount || 0) > 0);
    // Apply search
    return searchMembers(filtered, searchQuery);
  };

  const filteredMembers = getFilteredMembers();
  const filters = [
    { id: 'all', label: `All (${members.length})` },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'dues', label: 'Dues' },
  ];

  const getLastAttendance = (memberId) => {
    const memberAtt = attendance
      .filter(a => a.memberId === memberId && a.type === 'checkin')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return memberAtt.length > 0 ? formatDisplayDate(memberAtt[0].timestamp) : '-';
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Member', `Are you sure you want to delete ${item.name}?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMember(item.id) },
    ]);
  };

  const isMemberCheckedIn = (memberId) => {
    const today = new Date().toDateString();
    const todayRecords = attendance.filter(a =>
      a.memberId === memberId && new Date(a.timestamp).toDateString() === today
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let checkedIn = false;
    todayRecords.forEach(r => {
      if (r.type === 'checkin') checkedIn = true;
      if (r.type === 'checkout') checkedIn = false;
    });
    return checkedIn;
  };

  const handleCheckInOut = async (item) => {
    const isIn = isMemberCheckedIn(item.id);
    if (isIn) {
      const result = await checkOut(item.id);
      if (result) Alert.alert('Check Out', `${item.name} checked out!`);
    } else {
      const result = await checkIn(item.id);
      if (result) Alert.alert('Check In', `${item.name} checked in!`);
    }
  };

  const renderMember = ({ item }) => {
    const status = getMemberStatus(item);
    const statusColor = getStatusColor(status);
    const isExpired = status === 'expired';
    return (
        <Card style={[styles.memberCard, { backgroundColor: c.surface, borderTopWidth: 3, borderTopColor: statusColor }]}>
          <Card.Content style={{ paddingVertical: 12 }}>
            {/* Top row: Roll No + Status */}
            <View style={styles.topRow}>
              <View style={[styles.rollBadge, { borderColor: statusColor }]}>
                <Text style={[styles.rollText, { color: statusColor }]}>{item.rollNo || '-'}</Text>
              </View>
              <Chip mode="flat" style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}
                textStyle={{ fontSize: 12, fontWeight: 'bold', color: statusColor }}>
                {getStatusLabel(status)}
              </Chip>
            </View>

            {/* Info Rows */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: c.muted }]}>Name:</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{item.name}</Text>
              </View>
              <Divider style={{ backgroundColor: 'rgba(150,150,150,0.2)' }} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: c.muted }]}>Membership:</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{item.plan || '-'}</Text>
              </View>
              <Divider style={{ backgroundColor: 'rgba(150,150,150,0.2)' }} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: c.muted }]}>Expiry:</Text>
                <Text style={[styles.infoValue, { color: isExpired ? '#E53935' : '#4CAF50', fontWeight: '600' }]}>
                  {formatDisplayDate(item.endDate)}
                </Text>
              </View>
              <Divider style={{ backgroundColor: 'rgba(150,150,150,0.2)' }} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: c.muted }]}>Last Attendance:</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{getLastAttendance(item.id)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.btnGrid}>
              <View style={styles.btnRow}>
                {(() => {
                  const isIn = isMemberCheckedIn(item.id);
                  return (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isIn ? '#FF5252' : '#4CAF50' }]}
                      onPress={() => handleCheckInOut(item)}>
                      <MaterialCommunityIcons name={isIn ? 'logout' : 'login'} size={18} color="#fff" />
                      <Text style={styles.btnText}>{isIn ? 'Check Out' : 'Check In'}</Text>
                    </TouchableOpacity>
                  );
                })()}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196F3' }]}
                  onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}>
                  <MaterialCommunityIcons name="information" size={18} color="#fff" />
                  <Text style={styles.btnText}>Details</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFC107' }]}
                  onPress={() => navigation.navigate('AddMember', { memberId: item.id })}>
                  <MaterialCommunityIcons name="square-edit-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F44336' }]}
                  onPress={() => handleDelete(item)}>
                  <MaterialCommunityIcons name="delete" size={18} color="#fff" />
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.actionBtnFull, { backgroundColor: '#9C27B0' }]}
                onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}>
                <MaterialCommunityIcons name="currency-inr" size={18} color="#fff" />
                <Text style={styles.btnText}>Pay & Extend Membership</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Searchbar placeholder="Search by name, phone, roll no, father name..." value={searchQuery}
        onChangeText={setSearchQuery} style={[styles.searchBar, { backgroundColor: c.surface }]} />
      
      <View style={styles.filterRow}>
        {filters.map(f => (
          <Chip key={f.id} selected={selectedFilter === f.id} onPress={() => setSelectedFilter(f.id)}
            style={[styles.filterChip, selectedFilter === f.id && { backgroundColor: 'rgba(255,107,53,0.15)' }]}
            textStyle={{ fontSize: 12, color: selectedFilter === f.id ? c.primary : c.muted }}>
            {f.label}
          </Chip>
        ))}
        <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />}>
          <Menu.Item onPress={() => { setMenuVisible(false); Alert.alert('Export', 'Export to Excel coming soon!'); }}
            title="Export Excel" leadingIcon="file-excel" />
          <Menu.Item onPress={() => { setMenuVisible(false); Alert.alert('Import', 'Import from Excel coming soon!'); }}
            title="Import Excel" leadingIcon="file-import" />
        </Menu>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group" size={60} color={c.muted} />
            <Text style={[styles.emptyText, { color: c.muted }]}>No members found</Text>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: c.primary }]}
              onPress={() => navigation.navigate('AddMember')}>
              <Text style={styles.addBtnText}>+ Add First Member</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff"
        onPress={() => navigation.navigate('AddMember')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { marginHorizontal: 12, marginTop: 12, marginBottom: 8, elevation: 2, borderRadius: 10 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 5, flexWrap: 'wrap' },
  filterChip: { marginRight: 6, marginBottom: 4, height: 32 },
  memberCard: { marginHorizontal: 12, marginVertical: 6, elevation: 3, borderRadius: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rollBadge: { borderWidth: 2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  rollText: { fontSize: 14, fontWeight: 'bold' },
  statusBadge: { height: 28 },
  infoSection: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 14, fontStyle: 'italic' },
  infoValue: { fontSize: 15, fontWeight: '600' },
  btnGrid: { marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 8, gap: 6 },
  actionBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 6 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, marginTop: 10, marginBottom: 20 },
  addBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
