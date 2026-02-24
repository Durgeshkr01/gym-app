import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase-config';
import { logout } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [weightData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [75, 74, 73, 72, 71, 70] }],
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const profileStats = [
    { icon: 'weight', label: 'Weight', value: '70 kg', color: '#4CAF50' },
    { icon: 'human-male-height', label: 'Height', value: '175 cm', color: '#2196F3' },
    { icon: 'calculator', label: 'BMI', value: '22.9', color: '#FF9800' },
    { icon: 'fire', label: 'Calories', value: '2200', color: '#F44336' },
  ];

  const menuItems = [
    { icon: 'account-edit', label: 'Edit Profile', action: () => {} },
    { icon: 'credit-card', label: 'Membership', action: () => {} },
    { icon: 'chart-line', label: 'Body Measurements', action: () => {} },
    { icon: 'food-apple', label: 'Diet Plan', action: () => {} },
    { icon: 'calendar', label: 'Attendance History', action: () => {} },
    { icon: 'bell', label: 'Notifications', action: () => {} },
    { icon: 'cog', label: 'Settings', action: () => {} },
    { icon: 'help-circle', label: 'Help & Support', action: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.charAt(0) || 'M'} 
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || 'Member'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.membershipBadge}>
                <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
                <Text style={styles.membershipText}>
                  {user?.membershipStatus === 'active' ? 'Premium Member' : 'Free Member'}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {profileStats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name={stat.icon} size={28} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Weight Progress Chart */}
      <Text style={styles.sectionTitle}>Weight Progress</Text>
      <Card style={styles.chartCard}>
        <Card.Content>
          <LineChart
            data={weightData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF6B35',
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartSubtext}>You've lost 5 kg in 6 months! 🎉</Text>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Text style={styles.sectionTitle}>Account Settings</Text>
      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <View key={index}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#666" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            {index < menuItems.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        Logout
      </Button>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// Add TouchableOpacity import at the top
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerCard: {
    margin: 15,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#FF6B35',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFF9E6',
    padding: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  membershipText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F7931E',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 45) / 2,
    marginBottom: 15,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  chartCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartSubtext: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  menuCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  logoutButton: {
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#F44336',
  },
});
