import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, SegmentedButtons, TextInput, Button, FAB, Chip, IconButton, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

export default function WorkoutDietScreen({ navigation }) {
  const { theme } = useTheme();
  const { workoutPlans, dietPlans, saveWorkoutPlans, saveDietPlans } = useData();
  const c = theme.colors;
  const [tab, setTab] = useState('workout');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', exercises: '', duration: '', category: 'General' });
  const [dietForm, setDietForm] = useState({ name: '', description: '', meals: '', calories: '', type: 'Weight Loss' });

  const workoutCategories = ['General', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'];
  const dietTypes = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Lean Bulk', 'Vegetarian', 'Non-Veg'];

  const handleAddWorkout = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Enter plan name'); return; }
    const plan = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      exercises: form.exercises.split('\n').filter(e => e.trim()),
      duration: form.duration,
      category: form.category,
      createdAt: new Date().toISOString(),
    };
    await saveWorkoutPlans([...workoutPlans, plan]);
    setForm({ name: '', description: '', exercises: '', duration: '', category: 'General' });
    setShowAdd(false);
    Alert.alert('Success', 'Workout plan added!');
  };

  const handleAddDiet = async () => {
    if (!dietForm.name.trim()) { Alert.alert('Error', 'Enter plan name'); return; }
    const plan = {
      id: Date.now().toString(),
      name: dietForm.name,
      description: dietForm.description,
      meals: dietForm.meals.split('\n').filter(m => m.trim()),
      calories: dietForm.calories,
      type: dietForm.type,
      createdAt: new Date().toISOString(),
    };
    await saveDietPlans([...dietPlans, plan]);
    setDietForm({ name: '', description: '', meals: '', calories: '', type: 'Weight Loss' });
    setShowAdd(false);
    Alert.alert('Success', 'Diet plan added!');
  };

  const handleDeleteWorkout = (id) => {
    Alert.alert('Delete', 'Delete this workout plan?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveWorkoutPlans(workoutPlans.filter(w => w.id !== id)) },
    ]);
  };

  const handleDeleteDiet = (id) => {
    Alert.alert('Delete', 'Delete this diet plan?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveDietPlans(dietPlans.filter(d => d.id !== id)) },
    ]);
  };

  const renderWorkoutTab = () => (
    <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
      {showAdd && tab === 'workout' && (
        <Card style={[styles.addCard, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: c.primary, marginBottom: 10 }}>New Workout Plan</Text>
            <TextInput label="Plan Name *" value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))}
              mode="outlined" style={styles.inp} dense />
            <TextInput label="Description" value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))}
              mode="outlined" style={styles.inp} dense />
            <Text style={{ fontSize: 12, color: c.muted, marginBottom: 5 }}>Category</Text>
            <View style={styles.chipRow}>
              {workoutCategories.map(cat => (
                <Chip key={cat} selected={form.category === cat} onPress={() => setForm(p => ({ ...p, category: cat }))}
                  style={[styles.chip, form.category === cat && { backgroundColor: 'rgba(255,107,53,0.15)' }]}
                  textStyle={{ fontSize: 11 }}>{cat}</Chip>
              ))}
            </View>
            <TextInput label="Duration (e.g., 45 mins)" value={form.duration} onChangeText={v => setForm(p => ({ ...p, duration: v }))}
              mode="outlined" style={styles.inp} dense />
            <TextInput label="Exercises (one per line)" value={form.exercises}
              onChangeText={v => setForm(p => ({ ...p, exercises: v }))}
              mode="outlined" multiline numberOfLines={4} style={styles.inp}
              placeholder={"Bench Press 3x12\nIncline Dumbbell Press 3x10\nCable Fly 3x15"} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
              <Button mode="contained" onPress={handleAddWorkout} style={{ flex: 1, backgroundColor: c.primary }}>Save</Button>
              <Button mode="outlined" onPress={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {workoutPlans.length === 0 && !showAdd ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="dumbbell" size={50} color={c.muted} />
          <Text style={{ color: c.muted, marginTop: 10 }}>No workout plans yet</Text>
          <Button mode="contained" onPress={() => setShowAdd(true)} style={{ marginTop: 15, backgroundColor: c.primary }}>
            Create First Plan</Button>
        </View>
      ) : (
        workoutPlans.map(plan => (
          <Card key={plan.id} style={[styles.planCard, { backgroundColor: c.surface }]}>
            <Card.Content>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,107,53,0.12)' }]}>
                  <MaterialCommunityIcons name="dumbbell" size={22} color={c.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.planName, { color: c.text }]}>{plan.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Chip mode="flat" style={{ height: 20, backgroundColor: 'rgba(255,107,53,0.1)' }}
                      textStyle={{ fontSize: 9, color: c.primary }}>{plan.category}</Chip>
                    {plan.duration ? <Text style={{ fontSize: 11, color: c.muted }}>⏱ {plan.duration}</Text> : null}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteWorkout(plan.id)}>
                  <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
              {plan.description ? <Text style={{ fontSize: 12, color: c.muted, marginTop: 6 }}>{plan.description}</Text> : null}
              {plan.exercises && plan.exercises.length > 0 && (
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderColor: '#E0E0E0' }}>
                  {plan.exercises.map((ex, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                      <Text style={{ fontSize: 12, color: c.primary, marginRight: 6 }}>{i + 1}.</Text>
                      <Text style={{ fontSize: 12, color: c.text }}>{ex}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );

  const renderDietTab = () => (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
      {showAdd && tab === 'diet' && (
        <Card style={[styles.addCard, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#4CAF50', marginBottom: 10 }}>New Diet Plan</Text>
            <TextInput label="Plan Name *" value={dietForm.name} onChangeText={v => setDietForm(p => ({ ...p, name: v }))}
              mode="outlined" style={styles.inp} dense />
            <TextInput label="Description" value={dietForm.description} onChangeText={v => setDietForm(p => ({ ...p, description: v }))}
              mode="outlined" style={styles.inp} dense />
            <Text style={{ fontSize: 12, color: c.muted, marginBottom: 5 }}>Diet Type</Text>
            <View style={styles.chipRow}>
              {dietTypes.map(t => (
                <Chip key={t} selected={dietForm.type === t} onPress={() => setDietForm(p => ({ ...p, type: t }))}
                  style={[styles.chip, dietForm.type === t && { backgroundColor: '#4CAF50' + '20' }]}
                  textStyle={{ fontSize: 11 }}>{t}</Chip>
              ))}
            </View>
            <TextInput label="Target Calories" value={dietForm.calories} onChangeText={v => setDietForm(p => ({ ...p, calories: v }))}
              mode="outlined" keyboardType="number-pad" style={styles.inp} dense />
            <TextInput label="Meals (one per line)" value={dietForm.meals}
              onChangeText={v => setDietForm(p => ({ ...p, meals: v }))}
              mode="outlined" multiline numberOfLines={4} style={styles.inp}
              placeholder={"6 AM - Warm water + lemon\n8 AM - Oats + banana\n1 PM - Roti + sabzi + dal"} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
              <Button mode="contained" onPress={handleAddDiet} style={{ flex: 1, backgroundColor: '#4CAF50' }}>Save</Button>
              <Button mode="outlined" onPress={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {dietPlans.length === 0 && !showAdd ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="food-apple" size={50} color={c.muted} />
          <Text style={{ color: c.muted, marginTop: 10 }}>No diet plans yet</Text>
          <Button mode="contained" onPress={() => setShowAdd(true)} style={{ marginTop: 15, backgroundColor: '#4CAF50' }}>
            Create First Plan</Button>
        </View>
      ) : (
        dietPlans.map(plan => (
          <Card key={plan.id} style={[styles.planCard, { backgroundColor: c.surface }]}>
            <Card.Content>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: '#4CAF5015' }]}>
                  <MaterialCommunityIcons name="food-apple" size={22} color="#4CAF50" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.planName, { color: c.text }]}>{plan.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Chip mode="flat" style={{ height: 20, backgroundColor: '#4CAF5012' }}
                      textStyle={{ fontSize: 9, color: '#4CAF50' }}>{plan.type}</Chip>
                    {plan.calories ? <Text style={{ fontSize: 11, color: c.muted }}>🔥 {plan.calories} cal</Text> : null}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteDiet(plan.id)}>
                  <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
              {plan.description ? <Text style={{ fontSize: 12, color: c.muted, marginTop: 6 }}>{plan.description}</Text> : null}
              {plan.meals && plan.meals.length > 0 && (
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderColor: '#E0E0E0' }}>
                  {plan.meals.map((meal, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                      <MaterialCommunityIcons name="silverware-fork-knife" size={12} color="#4CAF50" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: c.text }}>{meal}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SegmentedButtons value={tab} onValueChange={v => { setTab(v); setShowAdd(false); }}
        buttons={[
          { value: 'workout', label: 'Workout Plans', icon: 'dumbbell' },
          { value: 'diet', label: 'Diet Plans', icon: 'food-apple' },
        ]}
        style={{ margin: 12, marginBottom: 5 }} />
      {tab === 'workout' ? renderWorkoutTab() : renderDietTab()}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: tab === 'workout' ? c.primary : '#4CAF50' }]}
        color="#fff" onPress={() => setShowAdd(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addCard: { marginBottom: 15, borderRadius: 10, elevation: 2 },
  inp: { marginBottom: 8, backgroundColor: 'transparent' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { height: 28 },
  planCard: { marginBottom: 10, borderRadius: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 15, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
