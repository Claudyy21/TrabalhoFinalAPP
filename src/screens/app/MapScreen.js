import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchTasks } from '../../database/tasks';

const PRIORITY_COLORS = {
  alta: '#E55353',
  media: '#E0A800',
  baixa: '#2F80ED',
};

export default function MapScreen({ navigation }) {
  const { theme } = useTheme();
  const mapRef = useRef(null);
  const [MapView, setMapView] = useState(null);
  const [Marker, setMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((mod) => {
        setMapView(() => mod.default);
        setMarker(() => mod.Marker);
      });
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks()
        .then((data) => setTasks(data.filter((t) => t.latitude != null && t.longitude != null)))
        .catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      }
      const data = await fetchTasks();
      setTasks(data.filter((t) => t.latitude != null && t.longitude != null));
    } catch {
      setError('Não foi possível carregar o mapa.\nVerifique sua conexão e permissões de localização.');
    } finally {
      setLoading(false);
    }
  };

  const centerOnUser = async () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setUserLocation(loc);
        mapRef.current?.animateToRegion({ ...loc, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      } else {
        Alert.alert('Permissão negada', 'Permita o acesso à localização nas configurações do dispositivo.');
      }
    }
  };

  const s = styles(theme);

  if (Platform.OS === 'web') {
    return (
      <View style={s.centered}>
        <Ionicons name="map-outline" size={48} color={theme.textMuted} />
        <Text style={s.webText}>O mapa não está disponível na versão web.</Text>
        <Text style={s.webSubtext}>Use o app no iOS ou Android para visualizar o mapa.</Text>
      </View>
    );
  }

  if (loading || !MapView || !Marker) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={s.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Ionicons name="wifi-outline" size={32} color={theme.danger} />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryButton} onPress={loadData}>
          <Text style={s.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: -15.7801, longitude: -47.9292, latitudeDelta: 10, longitudeDelta: 10 };

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        userInterfaceStyle={theme.dark ? 'dark' : 'light'}
      >
        {tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.latitude, longitude: task.longitude }}
            pinColor={PRIORITY_COLORS[task.prioridade] || theme.primary}
            title={task.titulo}
            description={task.descricao || task.nome_local || ''}
            onCalloutPress={() => navigation.navigate('TaskDetail', { task })}
          />
        ))}
      </MapView>

      <TouchableOpacity style={[s.centerButton, { backgroundColor: theme.card }]} onPress={centerOnUser}>
        <Ionicons name="locate" size={22} color={theme.primary} />
      </TouchableOpacity>

      {tasks.length > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} no mapa</Text>
        </View>
      )}

      {tasks.length === 0 && (
        <View style={[s.emptyOverlay, { backgroundColor: theme.dark ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.92)' }]}>
          <Text style={[s.emptyText, { color: theme.textSecondary }]}>Nenhuma tarefa com localização cadastrada ainda.</Text>
        </View>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: theme.background },
  loadingText: { marginTop: 12, fontSize: 14, color: theme.textSecondary },
  errorText: { marginTop: 8, fontSize: 14, color: theme.danger, textAlign: 'center' },
  retryButton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.primary },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  webText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: theme.text, textAlign: 'center' },
  webSubtext: { marginTop: 6, fontSize: 13, color: theme.textMuted, textAlign: 'center' },
  centerButton: {
    position: 'absolute', bottom: 32, right: 16,
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  badge: {
    position: 'absolute', top: 16, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
  },
  badgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  emptyOverlay: { position: 'absolute', bottom: 32, left: 16, right: 72, padding: 12, borderRadius: 10 },
  emptyText: { fontSize: 13, textAlign: 'center' },
});