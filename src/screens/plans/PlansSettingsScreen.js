import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, SegmentedButtons, TextInput, Button, FAB, Switch, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrencyFull } from '../../utils/helpers';

export default function PlansSettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { plans, settings, addPlan, updatePlan, deletePlan, saveSettings } = useData();
  const c = theme.colors;
  const [tab, setTab] = useState('plans');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', duration: '', description: '' });
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleSavePlan = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Enter plan name'); return; }
    if (!form.amount || isNaN(form.amount)) { Alert.alert('Error', 'Enter valid amount'); return; }
    if (!form.duration || isNaN(form.duration)) { Alert.alert('Error', 'Enter valid duration in days'); return; }
    const planData = {
      name: form.name,
      amount: Number(form.amount),
      price: Number(form.amount),
      duration: Number(form.duration),
      description: form.description,
    };
    if (editingId) {
      await updatePlan(editingId, planData);
      setEditingId(null);
    } else {
      await addPlan(planData);
    }
    setForm({ name: '', amount: '', duration: '', description: '' });
    setShowAdd(false);
    Alert.alert('Success', editingId ? 'Plan updated!' : 'Plan added!');
  };

  const handleEdit = (plan) => {
    setForm({ name: plan.name, amount: String(plan.amount || plan.price || ''), duration: String(plan.duration), description: plan.description || '' });
    setEditingId(plan.id);
    setShowAdd(true);
  };

  const handleDelete = (plan) => {
    Alert.alert('Delete Plan', `Delete "${plan.name}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlan(plan.id) },
    ]);
  };

  const handleSaveSettings = async () => {
    await saveSettings(localSettings);
    Alert.alert('Settings Saved', 'Your settings have been updated!');
  };

  const renderPlansTab = () => (
    <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
      <Text style={{ fontSize: 12, color: c.muted, marginBottom: 10 }}>
        Manage membership plans. These plans will appear when adding/renewing members.
      </Text>

      {showAdd && (
        <Card style={[styles.addCard, { backgroundColor: '#FFF9E6' }]}>
          <Card.Content>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: c.primary, marginBottom: 10 }}>
              {editingId ? 'Edit Plan' : 'New Plan'}
            </Text>
            <TextInput label="Plan Name *" value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))}
              mode="outlined" style={styles.inp} dense placeholder="e.g., Monthly, Quarterly" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput label="Amount (₹) *" value={form.amount} onChangeText={v => setForm(p => ({ ...p, amount: v }))}
                mode="outlined" keyboardType="number-pad" style={[styles.inp, { flex: 1 }]} dense />
              <TextInput label="Duration (days) *" value={form.duration} onChangeText={v => setForm(p => ({ ...p, duration: v }))}
                mode="outlined" keyboardType="number-pad" style={[styles.inp, { flex: 1 }]} dense />
            </View>
            <TextInput label="Description" value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))}
              mode="outlined" style={styles.inp} dense />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
              <Button mode="contained" onPress={handleSavePlan} style={{ flex: 1, backgroundColor: c.primary }}>
                {editingId ? 'Update' : 'Add Plan'}</Button>
              <Button mode="outlined" onPress={() => { setShowAdd(false); setEditingId(null); }} style={{ flex: 1 }}>Cancel</Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {plans.map(plan => (
        <Card key={plan.id} style={[styles.planCard, { backgroundColor: c.surface }]}>
          <Card.Content>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,107,53,0.12)' }]}>
                <MaterialCommunityIcons name="tag" size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{plan.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
                  <Chip mode="flat" style={{ height: 22, backgroundColor: '#4CAF5015' }}
                    textStyle={{ fontSize: 10, color: '#4CAF50' }}>₹{plan.amount || plan.price || 0}</Chip>
                  <Chip mode="flat" style={{ height: 22, backgroundColor: '#2196F315' }}
                    textStyle={{ fontSize: 10, color: '#2196F3' }}>{plan.duration} days</Chip>
                </View>
                {plan.description ? <Text style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>{plan.description}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleEdit(plan)} style={{ padding: 5 }}>
                <MaterialCommunityIcons name="pencil" size={20} color={c.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(plan)} style={{ padding: 5 }}>
                <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      ))}

      {plans.length === 0 && !showAdd && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="tag-off" size={50} color={c.muted} />
          <Text style={{ color: c.muted, marginTop: 10 }}>No plans. Add your first plan!</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Card style={[styles.settingsCard, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.secTitle, { color: c.text }]}>Gym Details</Text>
          <TextInput label="Gym Name" value={localSettings.gymName || 'SG Fitness 2.0'}
            onChangeText={v => setLocalSettings(p => ({ ...p, gymName: v }))}
            mode="outlined" style={styles.inp} />
          <TextInput label="Owner Name" value={localSettings.ownerName || ''}
            onChangeText={v => setLocalSettings(p => ({ ...p, ownerName: v }))}
            mode="outlined" style={styles.inp} />
          <TextInput label="Phone" value={localSettings.gymPhone || ''}
            onChangeText={v => setLocalSettings(p => ({ ...p, gymPhone: v }))}
            mode="outlined" keyboardType="phone-pad" style={styles.inp} />
          <TextInput label="Address" value={localSettings.gymAddress || ''}
            onChangeText={v => setLocalSettings(p => ({ ...p, gymAddress: v }))}
            mode="outlined" style={styles.inp} />
        </Card.Content>
      </Card>

      <Card style={[styles.settingsCard, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.secTitle, { color: c.text }]}>Fee Settings</Text>
          <TextInput label="Admission Fee (₹)" value={String(localSettings.admissionFee || 200)}
            onChangeText={v => setLocalSettings(p => ({ ...p, admissionFee: Number(v) || 0 }))}
            mode="outlined" keyboardType="number-pad" style={styles.inp} />
          <TextInput label="Expiry Alert Days" value={String(localSettings.expiryAlertDays || 7)}
            onChangeText={v => setLocalSettings(p => ({ ...p, expiryAlertDays: Number(v) || 7 }))}
            mode="outlined" keyboardType="number-pad" style={styles.inp} />
          <Text style={{ fontSize: 11, color: c.muted }}>Members will appear in "Expiring" list this many days before expiry</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.settingsCard, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.secTitle, { color: c.text }]}>App Settings</Text>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '500' }}>Dark Mode</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>Toggle dark/light theme</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} color={c.primary} />
          </View>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '500' }}>Roll Numbers</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>Auto: 1, 2, 3, 4, 5...</Text>
            </View>
            <Text style={{ color: c.primary, fontWeight: 'bold' }}>Auto</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '500' }}>Currency Symbol</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>Displayed in payment screens</Text>
            </View>
            <TextInput value={localSettings.currency || '₹'}
              onChangeText={v => setLocalSettings(p => ({ ...p, currency: v }))}
              mode="outlined" style={{ width: 50, height: 36 }} dense />
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleSaveSettings}
        style={{ marginTop: 10, marginBottom: 30, backgroundColor: c.primary }} icon="content-save">
        Save Settings
      </Button>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SegmentedButtons value={tab} onValueChange={setTab}
        buttons={[
          { value: 'plans', label: 'Plans', icon: 'tag' },
          { value: 'settings', label: 'Settings', icon: 'cog' },
        ]}
        style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 5 }} />
      {tab === 'plans' ? renderPlansTab() : renderSettingsTab()}
      {tab === 'plans' && <FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff"
        onPress={() => { setEditingId(null); setForm({ name: '', amount: '', duration: '', description: '' }); setShowAdd(true); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addCard: { marginBottom: 15, borderRadius: 10, elevation: 2 },
  inp: { marginBottom: 8, backgroundColor: 'transparent' },
  planCard: { marginBottom: 8, borderRadius: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingsCard: { marginBottom: 12, borderRadius: 10, elevation: 1 },
  secTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#E0E0E0' },
  empty: { alignItems: 'center', paddingTop: 60 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
