import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Switch, ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProximity } from '../../contexts/ProximityContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, isDark, toggleTheme, resetToSystem } = useTheme();
  const { radius, setRadius } = useProximity();
  const [loading, setLoading] = useState(false);
  const [localRadius, setLocalRadius] = useState(radius);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusSave = (value) => {
    const rounded = Math.round(value);
    setLocalRadius(rounded);
    setRadius(rounded);
  };

  const formatRadius = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
    return `${value} m`;
  };

  const s = styles(theme);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
    >
      {/* Avatar e info */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Ionicons name="person" size={32} color={theme.primary} />
        </View>
        <Text style={s.email}>{user?.email}</Text>
        <Text style={s.userId} numberOfLines={1}>ID: {user?.id}</Text>
      </View>

      {/* Tema */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={20}
            color={theme.primary}
          />
          <Text style={s.cardTitle}>Tema</Text>
        </View>

        <View style={s.themeRow}>
          <Text style={s.themeLabel}>
            {isDark ? 'Modo escuro' : 'Modo claro'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.surfaceBorder, true: theme.primary }}
            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={s.resetButton} onPress={resetToSystem}>
          <Ionicons name="phone-portrait-outline" size={14} color={theme.textMuted} />
          <Text style={s.resetButtonText}>Usar tema do sistema</Text>
        </TouchableOpacity>
      </View>

      {/* Raio de proximidade */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="radio-outline" size={20} color={theme.primary} />
          <Text style={s.cardTitle}>Raio de alerta de proximidade</Text>
        </View>
        <Text style={s.radiusValue}>{formatRadius(localRadius)}</Text>
        <Slider
          style={s.slider}
          minimumValue={100}
          maximumValue={2000}
          step={50}
          value={localRadius}
          onValueChange={(v) => setLocalRadius(Math.round(v))}
          onSlidingComplete={handleRadiusSave}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.surfaceBorder}
          thumbTintColor={theme.primary}
        />
        <View style={s.sliderLabels}>
          <Text style={s.sliderLabel}>100 m</Text>
          <Text style={s.sliderLabel}>2 km</Text>
        </View>
        <Text style={s.cardHint}>
          Você será notificado ao se aproximar de uma tarefa dentro deste raio.
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[s.logoutButton, loading && s.buttonDisabled]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.danger} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            <Text style={s.logoutText}>Sair</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: theme.textMuted,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  themeLabel: {
    fontSize: 15,
    color: theme.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetButtonText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  radiusValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.textMuted,
  },
  cardHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.dangerLight,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  logoutText: {
    color: theme.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});