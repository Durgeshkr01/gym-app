import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

let deferredPrompt = null;

// Listen for beforeinstallprompt (web only)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export default function InstallBanner() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Show banner after a small delay
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setIsInstalled(true);
      }
      deferredPrompt = null;
    } else {
      // Fallback: show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Install karne ke liye:\n1. Safari mein Share button (⬆️) dabao\n2. "Add to Home Screen" select karo');
      } else {
        alert('Install karne ke liye:\n1. Browser ka menu (⋮) khole\n2. "Add to Home Screen" ya "Install App" select karo');
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (Platform.OS !== 'web' || !showBanner || isInstalled) return null;

  return (
    <View style={[styles.banner, { backgroundColor: c.primary }]}>
      <View style={styles.bannerContent}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>SG Fitness App Install Karo!</Text>
          <Text style={styles.bannerSub}>Phone mein app ki tarah chalao</Text>
        </View>
      </View>
      <View style={styles.bannerActions}>
        <TouchableOpacity style={styles.installBtn} onPress={handleInstall}>
          <MaterialCommunityIcons name="download" size={18} color="#FF6B35" />
          <Text style={styles.installText}>INSTALL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 1,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  installText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dismissBtn: {
    padding: 4,
  },
});
