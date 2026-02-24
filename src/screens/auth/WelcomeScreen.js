import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Button, Text } from 'react-native-paper';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>SG Fitness Evolution</Text>
            <Text style={styles.subtitle}>Transform Your Body, Transform Your Life</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Login
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Register')}
              style={[styles.button, styles.outlineButton]}
              labelStyle={styles.outlineButtonLabel}
            >
              Sign Up
            </Button>

            <Text style={styles.footerText}>
              Your fitness journey starts here!
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    marginTop: height * 0.15,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    marginBottom: 50,
  },
  button: {
    marginBottom: 15,
    paddingVertical: 8,
    backgroundColor: '#FF6B35',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    borderColor: '#fff',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  outlineButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
