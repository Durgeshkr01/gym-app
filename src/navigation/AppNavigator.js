import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Tab Screens
import HomeScreen from '../screens/home/HomeScreen';
import MembersScreen from '../screens/members/MembersScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import MoreScreen from '../screens/more/MoreScreen';

// Sub Screens - Members
import AddMemberScreen from '../screens/members/AddMemberScreen';
import MemberDetailScreen from '../screens/members/MemberDetailScreen';

// Sub Screens - Features
import EnquiryScreen from '../screens/enquiry/EnquiryScreen';
import BroadcastScreen from '../screens/broadcast/BroadcastScreen';
import MessageSettingsScreen from '../screens/messages/MessageSettingsScreen';
import WorkoutDietScreen from '../screens/workout/WorkoutDietScreen';
import PlansSettingsScreen from '../screens/plans/PlansSettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          else if (route.name === 'Members') iconName = focused ? 'account-group' : 'account-group-outline';
          else if (route.name === 'Attendance') iconName = 'login-variant';
          else if (route.name === 'Payments') iconName = 'cash-multiple';
          else if (route.name === 'More') iconName = 'menu';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        headerStyle: { backgroundColor: c.header },
        headerTintColor: c.headerText,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Members" component={MembersScreen} options={{ title: 'Members' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Tab.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Payments' }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { theme } = useTheme();
  const c = theme.colors;
  const headerStyle = {
    headerStyle: { backgroundColor: c.header },
    headerTintColor: c.headerText,
    headerTitleStyle: { fontWeight: 'bold' },
  };

  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} options={{ title: 'Add Member', ...headerStyle }} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} options={{ title: 'Member Details', ...headerStyle }} />
      <Stack.Screen name="Enquiry" component={EnquiryScreen} options={{ title: 'Enquiry Management', ...headerStyle }} />
      <Stack.Screen name="Broadcast" component={BroadcastScreen} options={{ title: 'Broadcast', ...headerStyle }} />
      <Stack.Screen name="MessageSettings" component={MessageSettingsScreen} options={{ title: 'Message Templates', ...headerStyle }} />
      <Stack.Screen name="WorkoutDiet" component={WorkoutDietScreen} options={{ title: 'Workout & Diet', ...headerStyle }} />
      <Stack.Screen name="PlansSettings" component={PlansSettingsScreen} options={{ title: 'Plans & Settings', ...headerStyle }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications', ...headerStyle }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports & Analytics', ...headerStyle }} />
    </Stack.Navigator>
  );
}
