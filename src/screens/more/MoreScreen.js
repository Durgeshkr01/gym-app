import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Switch, Button, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { shareApp, formatCurrency } from '../../utils/helpers';

export default function MoreScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { getDashboardStats, backupData, restoreData, settings } = useData();
  const c = theme.colors;
  const [stats, setStats] = useState({});

  useFocusEffect(useCallback(() => {
    setStats(getDashboardStats());
  }, []));

  const handleBackup = async () => {
    try {
      const data = await backupData();
      Alert.alert('Backup Ready', `Backup contains:\n• ${data.members?.length || 0} Members\n• ${data.payments?.length || 0} Payments\n• ${data.attendance?.length || 0} Attendance Records\n• ${data.enquiries?.length || 0} Enquiries\n\nData is stored locally on your device.`);
    } catch (e) {
      Alert.alert('Error', 'Backup failed');
    }
  };

  const handleRestore = () => {
    Alert.alert('Restore Data', 'This will restore from the last backup. Current data may be overwritten.', [
      { text: 'Cancel' },
      { text: 'Restore', onPress: async () => {
        try {
          await restoreData();
          Alert.alert('Success', 'Data restored!');
        } catch (e) {
          Alert.alert('Error', 'No backup found or restore failed');
        }
      }},
    ]);
  };

  const menuItems = [
    {
      section: 'Management',
      items: [
        { icon: 'tag', label: 'Plans & Settings', desc: 'Manage membership plans, fees, gym settings',
          color: '#FF6B35', screen: 'PlansSettings' },
        { icon: 'message-text', label: 'Message Templates', desc: 'Customize WhatsApp/SMS templates',
          color: '#4CAF50', screen: 'MessageSettings' },
        { icon: 'bullhorn', label: 'Broadcast Messages', desc: 'Send bulk messages to members',
          color: '#2196F3', screen: 'Broadcast' },
        { icon: 'dumbbell', label: 'Workout & Diet', desc: 'Manage workout & diet plans',
          color: '#9C27B0', screen: 'WorkoutDiet' },
        { icon: 'chart-bar', label: 'Reports', desc: 'View analytics & reports',
          color: '#FF9800', screen: 'Reports' },
      ],
    },
    {
      section: 'Communication',
      items: [
        { icon: 'account-question', label: 'Enquiries', desc: 'Manage walk-in & phone enquiries',
          color: '#009688', screen: 'Enquiry' },
        { icon: 'bell', label: 'Notifications', desc: 'Birthday, expiry & dues alerts',
          color: '#E91E63', screen: 'Notifications' },
      ],
    },
    {
      section: 'Data & Backup',
      items: [
        { icon: 'cloud-upload', label: 'Backup Data', desc: 'Create backup of all gym data',
          color: '#4CAF50', action: handleBackup },
        { icon: 'cloud-download', label: 'Restore Data', desc: 'Restore from last backup',
          color: '#FF9800', action: handleRestore },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: c.primary }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Avatar.Icon size={64} icon="dumbbell" style={{ backgroundColor: '#ffffff30' }} color="#fff" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 10 }}>
              {settings.gymName || 'SG Fitness 2.0'}
            </Text>
            <Text style={{ fontSize: 12, color: '#ffffffcc' }}>
              {settings.ownerName ? `Owner: ${settings.ownerName}` : 'Gym Admin App'}
            </Text>
            <View style={styles.quickStats}>
              <View style={styles.qStat}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{stats.totalMembers || 0}</Text>
                <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Members</Text>
              </View>
              <View style={[styles.qStatDivider]} />
              <View style={styles.qStat}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{stats.activeMembers || 0}</Text>
                <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Active</Text>
              </View>
              <View style={[styles.qStatDivider]} />
              <View style={styles.qStat}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{formatCurrency(stats.monthRevenue || 0)}</Text>
                <Text style={{ fontSize: 10, color: '#ffffffaa' }}>Revenue</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Theme Toggle */}
        <Card style={[styles.themeCard, { backgroundColor: c.surface }]}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={24}
                color={isDark ? '#FFD54F' : '#FF9800'} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '600', color: c.text }}>Dark Mode</Text>
                <Text style={{ fontSize: 12, color: c.muted }}>{isDark ? 'Dark theme active' : 'Light theme active'}</Text>
              </View>
              <Switch value={isDark} onValueChange={toggleTheme} color={c.primary} />
            </View>
          </Card.Content>
        </Card>

        {/* Menu Sections */}
        {menuItems.map((section, si) => (
          <View key={si}>
            <Text style={[styles.secTitle, { color: c.muted }]}>{section.section}</Text>
            <Card style={[styles.menuCard, { backgroundColor: c.surface }]}>
              <Card.Content style={{ padding: 0 }}>
                {section.items.map((item, i) => (
                  <React.Fragment key={i}>
                    <TouchableOpacity style={styles.menuItem}
                      onPress={() => item.screen ? navigation.navigate(item.screen) : item.action?.()}>
                      <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                        <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>{item.label}</Text>
                        <Text style={{ fontSize: 11, color: c.muted }}>{item.desc}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={22} color={c.muted} />
                    </TouchableOpacity>
                    {i < section.items.length - 1 && <Divider style={{ marginLeft: 60 }} />}
                  </React.Fragment>
                ))}
              </Card.Content>
            </Card>
          </View>
        ))}

        {/* Footer Actions */}
        <Card style={[styles.menuCard, { backgroundColor: c.surface, marginHorizontal: 12 }]}>
          <Card.Content style={{ padding: 0 }}>
            <TouchableOpacity style={styles.menuItem} onPress={shareApp}>
              <View style={[styles.menuIcon, { backgroundColor: '#4CAF5015' }]}>
                <MaterialCommunityIcons name="share-variant" size={22} color="#4CAF50" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>Share App</Text>
                <Text style={{ fontSize: 11, color: c.muted }}>Share with other gym owners</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={c.muted} />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <Text style={{ textAlign: 'center', color: c.muted, fontSize: 11, marginTop: 20 }}>
          SG Fitness 2.0 v2.0.0{'\n'}Made with ❤️ for Gym Owners
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { margin: 12, borderRadius: 15, elevation: 3 },
  quickStats: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#ffffff30', width: '100%', justifyContent: 'space-around' },
  qStat: { alignItems: 'center' },
  qStatDivider: { width: 1, backgroundColor: '#ffffff30', height: '100%' },
  themeCard: { marginHorizontal: 12, marginBottom: 5, borderRadius: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  secTitle: { fontSize: 12, fontWeight: '700', marginLeft: 16, marginTop: 12, marginBottom: 5, textTransform: 'uppercase' },
  menuCard: { marginHorizontal: 12, marginBottom: 5, borderRadius: 10, elevation: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
