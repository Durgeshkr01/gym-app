import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, Button, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [period, setPeriod] = useState('month');

  const weightData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [72, 71.5, 71, 70.5],
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
      },
    ],
  };

  const progressData = {
    labels: ['Strength', 'Cardio', 'Flexibility'],
    data: [0.7, 0.6, 0.5],
  };

  const measurements = [
    { label: 'Chest', value: '100 cm', change: '+2 cm', icon: 'human', color: '#FF6B35' },
    { label: 'Waist', value: '85 cm', change: '-3 cm', icon: 'tape-measure', color: '#4CAF50' },
    { label: 'Arms', value: '35 cm', change: '+1 cm', icon: 'arm-flex', color: '#2196F3' },
    { label: 'Legs', value: '60 cm', change: '+2 cm', icon: 'human-male', color: '#9C27B0' },
  ];

  const milestones = [
    { id: 1, title: '5 kg Weight Loss', achieved: true, date: '2 weeks ago' },
    { id: 2, title: '30 Days Streak', achieved: true, date: '1 week ago' },
    { id: 3, title: '50 Workouts', achieved: false, progress: 42 },
    { id: 4, title: '10 kg Weight Loss', achieved: false, progress: 50 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Weight Progress Chart */}
      <Text style={styles.sectionTitle}>Weight Progress</Text>
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.currentWeight}>70.5 kg</Text>
              <Text style={styles.weightChange}>-1.5 kg this month</Text>
            </View>
            <View style={styles.goalBadge}>
              <Text style={styles.goalText}>Goal: 68 kg</Text>
            </View>
          </View>
          <LineChart
            data={weightData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
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
        </Card.Content>
      </Card>

      {/* Fitness Progress */}
      <Text style={styles.sectionTitle}>Fitness Progress</Text>
      <Card style={styles.chartCard}>
        <Card.Content>
          <ProgressChart
            data={progressData}
            width={width - 60}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1, index) => {
                const colors = ['#FF6B35', '#4CAF50', '#2196F3'];
                return colors[index] || `rgba(0, 0, 0, ${opacity})`;
              },
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            hideLegend={false}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Body Measurements */}
      <Text style={styles.sectionTitle}>Body Measurements</Text>
      <View style={styles.measurementsGrid}>
        {measurements.map((item, index) => (
          <Card key={index} style={styles.measurementCard}>
            <Card.Content style={styles.measurementContent}>
              <View style={[styles.measurementIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.measurementLabel}>{item.label}</Text>
              <Text style={styles.measurementValue}>{item.value}</Text>
              <Text style={[
                styles.measurementChange,
                { color: item.change.startsWith('+') ? '#4CAF50' : '#F44336' }
              ]}>
                {item.change}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Add Measurement Button */}
      <Button
        mode="outlined"
        icon="plus"
        onPress={() => {}}
        style={styles.addButton}
      >
        Add New Measurement
      </Button>

      {/* Milestones */}
      <Text style={styles.sectionTitle}>Milestones</Text>
      {milestones.map((milestone) => (
        <Card key={milestone.id} style={styles.milestoneCard}>
          <Card.Content>
            <View style={styles.milestoneHeader}>
              <MaterialCommunityIcons
                name={milestone.achieved ? 'trophy' : 'trophy-outline'}
                size={30}
                color={milestone.achieved ? '#FFD700' : '#999'}
              />
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                {milestone.achieved ? (
                  <Text style={styles.milestoneDate}>Achieved {milestone.date}</Text>
                ) : (
                  <View style={styles.milestoneProgress}>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${milestone.progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{milestone.progress}%</Text>
                  </View>
                )}
              </View>
              {milestone.achieved && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </View>
          </Card.Content>
        </Card>
      ))}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  periodSelector: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  segmentedButtons: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  chartCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentWeight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  weightChange: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  goalBadge: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
  },
  goalText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  measurementCard: {
    width: (width - 45) / 2,
    marginBottom: 15,
    elevation: 2,
  },
  measurementContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  measurementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  measurementLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  measurementChange: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  addButton: {
    marginHorizontal: 15,
    marginBottom: 10,
    borderColor: '#FF6B35',
  },
  milestoneCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: 15,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  milestoneDate: {
    fontSize: 12,
    color: '#4CAF50',
  },
  milestoneProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    width: 35,
  },
});
