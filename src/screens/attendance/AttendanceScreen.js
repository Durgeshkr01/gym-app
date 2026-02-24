import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, Chip, SegmentedButtons, Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { searchMembers, formatTime } from '../../utils/helpers';

export default function AttendanceScreen({ navigation }) {
  const { theme } = useTheme();
  const { members, checkIn, checkOut, getTodayAttendance, attendance, getMemberStatus } = useData();
  const [activeTab, setActiveTab] = useState('checkin');
  const [searchQuery, setSearchQuery] = useState('');
  const [todayStats, setTodayStats] = useState({ todayCheckIns: 0, todayCheckOuts: 0, currentlyInGym: 0, currentlyInMembers: [], history: [] });
  const c = theme.colors;

  useFocusEffect(useCallback(() => {
    setTodayStats(getTodayAttendance());
  }, [attendance, getTodayAttendance]));

  const activeMembers = members.filter(m => getMemberStatus(m) !== 'expired');
  const searchedMembers = searchMembers(activeMembers, searchQuery);

  const handleCheckIn = async (member) => {
    const success = await checkIn(member.id);
    if (success) {
      Alert.alert('Checked In ✅', `${member.name} checked in at ${formatTime(new Date().toISOString())}`);
      setTodayStats(getTodayAttendance());
    }
  };

  const handleCheckOut = async (member) => {
    const success = await checkOut(member.id);
    if (success) {
      Alert.alert('Checked Out 🏠', `${member.name} checked out at ${formatTime(new Date().toISOString())}`);
      setTodayStats(getTodayAttendance());
    }
  };

  const renderMemberItem = ({ item }) => {
    const isInGym = todayStats.currentlyInMembers.some(m => m?.id === item.id);
    return (
      <Card style={[styles.memberCard, { backgroundColor: c.surface }]}>
        <Card.Content style={styles.memberRow}>
          <Avatar.Text size={44} label={item.name?.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: isInGym ? '#4CAF50' + '30' : '#9E9E9E' + '30' }}
            labelStyle={{ color: isInGym ? '#4CAF50' : '#9E9E9E', fontWeight: 'bold', fontSize: 16 }} />
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: c.text }]}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: c.muted }}>Roll #{item.rollNo} • {item.phone}</Text>
          </View>
          {activeTab === 'checkin' ? (
            <Button mode="contained" compact onPress={() => handleCheckIn(item)}
              style={{ backgroundColor: '#4CAF50' }} labelStyle={{ fontSize: 12 }}
              icon="login" disabled={isInGym}>{isInGym ? 'In Gym' : 'Check In'}</Button>
          ) : (
            <Button mode="contained" compact onPress={() => handleCheckOut(item)}
              style={{ backgroundColor: '#FF5252' }} labelStyle={{ fontSize: 12 }}
              icon="logout" disabled={!isInGym}>{isInGym ? 'Check Out' : 'Not In'}</Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderHistoryItem = ({ item }) => (
    <Card style={[styles.memberCard, { backgroundColor: c.surface }]}>
      <Card.Content style={styles.memberRow}>
        <View style={[styles.histIcon, { backgroundColor: item.type === 'checkin' ? '#4CAF50' + '20' : '#FF5252' + '20' }]}>
          <MaterialCommunityIcons name={item.type === 'checkin' ? 'login' : 'logout'}
            size={24} color={item.type === 'checkin' ? '#4CAF50' : '#FF5252'} />
        </View>
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: c.text }]}>{item.memberName}</Text>
          <Text style={{ fontSize: 12, color: c.muted }}>Roll #{item.memberRollNo}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Chip mode="flat" style={{ backgroundColor: item.type === 'checkin' ? '#4CAF50' + '20' : '#FF5252' + '20' }}
            textStyle={{ fontSize: 10, color: item.type === 'checkin' ? '#4CAF50' : '#FF5252' }}>
            {item.type === 'checkin' ? 'IN' : 'OUT'}
          </Chip>
          <Text style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{formatTime(item.timestamp)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { l: 'Check-Ins', v: todayStats.todayCheckIns, co: '#4CAF50', i: 'login' },
          { l: 'In Gym', v: todayStats.currentlyInGym, co: '#2196F3', i: 'account-group' },
          { l: 'Check-Outs', v: todayStats.todayCheckOuts, co: '#FF5252', i: 'logout' },
        ].map((s, i) => (
          <Card key={i} style={[styles.statCard, { backgroundColor: c.surface }]}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name={s.i} size={22} color={s.co} />
              <Text style={[styles.statVal, { color: c.text }]}>{s.v}</Text>
              <Text style={{ fontSize: 10, color: c.muted }}>{s.l}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Tabs */}
      <SegmentedButtons value={activeTab} onValueChange={setActiveTab} style={styles.tabs}
        buttons={[
          { value: 'checkin', label: 'Check In', icon: 'login' },
          { value: 'checkout', label: 'Check Out', icon: 'logout' },
          { value: 'history', label: 'History', icon: 'history' },
        ]} />

      {/* Search */}
      {activeTab !== 'history' && (
        <Searchbar placeholder="Search member..." value={searchQuery} onChangeText={setSearchQuery}
          style={[styles.search, { backgroundColor: c.surface }]} />
      )}

      {/* List */}
      {activeTab === 'history' ? (
        <FlatList data={todayStats.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
          renderItem={renderHistoryItem} keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="history" size={50} color={c.muted} />
              <Text style={{ color: c.muted, marginTop: 10 }}>No attendance records today</Text>
            </View>
          } />
      ) : (
        <FlatList data={searchedMembers} renderItem={renderMemberItem} keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-off" size={50} color={c.muted} />
              <Text style={{ color: c.muted, marginTop: 10 }}>No members found</Text>
            </View>
          } />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: 'row', padding: 15, paddingBottom: 5 },
  statCard: { flex: 1, marginHorizontal: 4, elevation: 2, borderRadius: 10 },
  statContent: { alignItems: 'center', paddingVertical: 8 },
  statVal: { fontSize: 22, fontWeight: 'bold', marginVertical: 2 },
  tabs: { marginHorizontal: 15, marginBottom: 10 },
  search: { marginHorizontal: 15, marginBottom: 10, elevation: 2, borderRadius: 10 },
  memberCard: { marginHorizontal: 15, marginVertical: 3, elevation: 1, borderRadius: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 15, fontWeight: '600' },
  histIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
});
