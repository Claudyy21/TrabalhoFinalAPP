import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTasks } from '../database/tasks';

const PROXIMITY_KEY = 'proximity_radius';
const DEFAULT_RADIUS = 100; // metros
const CHECK_INTERVAL = 30000; // 30 segundos
const NOTIFIED_KEY = 'notified_tasks';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ProximityContext = createContext({
  radius: DEFAULT_RADIUS,
  setRadius: () => {},
});

export function ProximityProvider({ children }) {
  const [radius, setRadiusState] = useState(DEFAULT_RADIUS);
  const intervalRef = useRef(null);
  const notifiedRef = useRef(new Set());
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadRadius();
    requestPermissions();
    startChecking();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        startChecking();
      } else if (nextState.match(/inactive|background/)) {
        stopChecking();
      }
      appState.current = nextState;
    });

    return () => {
      stopChecking();
      sub.remove();
    };
  }, []);

  // Reinicia o intervalo quando o raio muda
  useEffect(() => {
    stopChecking();
    startChecking();
  }, [radius]);

  const loadRadius = async () => {
    try {
      const saved = await AsyncStorage.getItem(PROXIMITY_KEY);
      if (saved) setRadiusState(Number(saved));
    } catch {}
  };

  const setRadius = async (value) => {
    setRadiusState(value);
    try {
      await AsyncStorage.setItem(PROXIMITY_KEY, String(value));
    } catch {}
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web') return;
    await Notifications.requestPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  const startChecking = () => {
    if (Platform.OS === 'web') return;
    stopChecking();
    checkProximity();
    intervalRef.current = setInterval(checkProximity, CHECK_INTERVAL);
  };

  const stopChecking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkProximity = async () => {
    if (Platform.OS === 'web') return;
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      const tasks = await fetchTasks();
      const nearby = tasks.filter(
        (t) =>
          !t.concluida &&
          t.latitude != null &&
          t.longitude != null &&
          !notifiedRef.current.has(t.id) &&
          getDistance(latitude, longitude, t.latitude, t.longitude) <= radius
      );

      for (const task of nearby) {
        notifiedRef.current.add(task.id);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📍 Tarefa próxima!',
            body: `Você está perto de: ${task.titulo}`,
            data: { taskId: task.id },
          },
          trigger: null, // imediata
        });
      }
    } catch {}
  };

  return (
    <ProximityContext.Provider value={{ radius, setRadius }}>
      {children}
    </ProximityContext.Provider>
  );
}

export const useProximity = () => useContext(ProximityContext);

// Fórmula de Haversine — distância entre dois pontos em metros
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}