import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WorkoutScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];

  const workoutPlans = [
    {
      id: 1,
      name: 'Upper Body Strength',
      duration: '45 mins',
      exercises: 10,
      difficulty: 'Intermediate',
      category: 'Chest',
      icon: 'arm-flex',
    },
    {
      id: 2,
      name: 'Leg Day Blast',
      duration: '50 mins',
      exercises: 12,
      difficulty: 'Advanced',
      category: 'Legs',
      icon: 'run',
    },
    {
      id: 3,
      name: 'Core Conditioning',
      duration: '30 mins',
      exercises: 8,
      difficulty: 'Beginner',
      category: 'Core',
      icon: 'yoga',
    },
    {
      id: 4,
      name: 'Back & Biceps',
      duration: '40 mins',
      exercises: 9,
      difficulty: 'Intermediate',
      category: 'Back',
      icon: 'weight-lifter',
    },
  ];

  const filteredWorkouts = selectedCategory === 'All' 
    ? workoutPlans 
    : workoutPlans.filter(workout => workout.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FFC107';
      case 'Advanced': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedChip
            ]}
            textStyle={selectedCategory === category && styles.selectedChipText}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {/* Workout Plans */}
      <ScrollView style={styles.workoutList}>
        <Text style={styles.sectionTitle}>Available Workouts</Text>
        
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} style={styles.workoutCard}>
            <Card.Content>
              <View style={styles.workoutHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name={workout.icon} 
                    size={40} 
                    color="#FF6B35" 
                  />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <View style={styles.workoutMeta}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                      <Text style={styles.metaText}>{workout.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="dumbbell" size={16} color="#666" />
                      <Text style={styles.metaText}>{workout.exercises} exercises</Text>
                    </View>
                  </View>
                  <Chip 
                    style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(workout.difficulty) + '20' }]}
                    textStyle={{ color: getDifficultyColor(workout.difficulty), fontSize: 12 }}
                  >
                    {workout.difficulty}
                  </Chip>
                </View>
              </View>
              
              <Button
                mode="contained"
                style={styles.startButton}
                onPress={() => {/* Navigate to workout details */}}
              >
                Start Workout
              </Button>
            </Card.Content>
          </Card>
        ))}

        {/* Exercise Library */}
        <Text style={styles.sectionTitle}>Exercise Library</Text>
        <Card style={styles.libraryCard}>
          <Card.Content>
            <View style={styles.libraryHeader}>
              <MaterialCommunityIcons name="book-open-variant" size={40} color="#FF6B35" />
              <View style={styles.libraryInfo}>
                <Text style={styles.libraryTitle}>Browse Exercises</Text>
                <Text style={styles.librarySubtitle}>200+ exercises with videos</Text>
              </View>
            </View>
            <Button mode="outlined" style={styles.browseButton}>
              Browse Library
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  categoryScroll: {
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryChip: {
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  selectedChip: {
    backgroundColor: '#FF6B35',
  },
  selectedChipText: {
    color: '#fff',
  },
  workoutList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  workoutCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  startButton: {
    backgroundColor: '#FF6B35',
  },
  libraryCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 3,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  libraryInfo: {
    marginLeft: 15,
    flex: 1,
  },
  libraryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  librarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  browseButton: {
    borderColor: '#FF6B35',
  },
});
