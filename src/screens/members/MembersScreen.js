import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Searchbar, FAB, Chip, Avatar, Card, Menu, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, makeCall, searchMembers, getStatusColor, getStatusLabel, formatDisplayDate } from '../../utils/helpers';

export default function MembersScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { members, getMemberStatus } = useData();
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
    if (selectedFilter === 'active') filtered = filtered.filter(m => getMemberStatus(m) === 'active');
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
    { id: 'expiring', label: 'Expiring' },
    { id: 'dues', label: 'Dues' },
  ];

  const renderMember = ({ item }) => {
    const status = getMemberStatus(item);
    const statusColor = getStatusColor(status);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}>
        <Card style={[styles.memberCard, { backgroundColor: c.surface }]}>
          <Card.Content style={styles.memberRow}>
            <View style={[styles.avatarBorder, { borderColor: statusColor }]}>
              <Avatar.Text size={50} label={item.name?.substring(0, 2).toUpperCase()} style={{ backgroundColor: statusColor + '30' }}
                labelStyle={{ color: statusColor, fontWeight: 'bold' }} />
            </View>
            <View style={styles.memberInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.memberName, { color: c.text }]}>{item.name}</Text>
                <Chip mode="flat" style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                  textStyle={{ fontSize: 10, color: statusColor }}>{getStatusLabel(status)}</Chip>
              </View>
              <Text style={{ fontSize: 12, color: c.muted }}>Roll #{item.rollNo} • {item.phone}</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>{item.plan} • Exp: {formatDisplayDate(item.endDate)}</Text>
              {(item.dueAmount || 0) > 0 && (
                <Text style={{ fontSize: 12, color: '#FF5252', fontWeight: 'bold' }}>Due: ₹{item.dueAmount}</Text>
              )}
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity onPress={() => openWhatsApp(item.phone)} style={styles.iconBtn}>
                <MaterialCommunityIcons name="whatsapp" size={22} color="#25D366" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => makeCall(item.phone)} style={styles.iconBtn}>
                <MaterialCommunityIcons name="phone" size={22} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Searchbar placeholder="Search by name, phone, roll no, father name..." value={searchQuery}
        onChangeText={setSearchQuery} style={[styles.searchBar, { backgroundColor: c.surface }]} />
      
      <View style={styles.filterRow}>
        {filters.map(f => (
          <Chip key={f.id} selected={selectedFilter === f.id} onPress={() => setSelectedFilter(f.id)}
            style={[styles.filterChip, selectedFilter === f.id && { backgroundColor: c.primary + '20' }]}
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
  searchBar: { margin: 15, marginBottom: 10, elevation: 2, borderRadius: 10 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 5, flexWrap: 'wrap' },
  filterChip: { marginRight: 6, marginBottom: 4, height: 32 },
  memberCard: { marginHorizontal: 15, marginVertical: 4, elevation: 2, borderRadius: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBorder: { borderWidth: 2, borderRadius: 28, padding: 2 },
  memberInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  memberName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusChip: { height: 22, marginLeft: 6 },
  actionBtns: { alignItems: 'center' },
  iconBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, marginTop: 10, marginBottom: 20 },
  addBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
