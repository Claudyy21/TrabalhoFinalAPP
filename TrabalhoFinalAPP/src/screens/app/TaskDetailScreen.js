import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const PRIORITY_CONFIG = (theme) => ({
  alta: { label: 'Alta', color: theme.danger, bg: theme.dangerLight },
  media: { label: 'Média', color: theme.warning, bg: theme.warningLight },
  baixa: { label: 'Baixa', color: theme.primary, bg: theme.primaryLight },
});

export default function TaskDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { task } = route.params;
  const priority = PRIORITY_CONFIG(theme)[task.prioridade] || PRIORITY_CONFIG(theme).media;
  const hasLocation = task.latitude != null && task.longitude != null;

  const [MapView, setMapView] = useState(null);
  const [Marker, setMarker] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'web' && hasLocation) {
      import('react-native-maps').then((mod) => {
        setMapView(() => mod.default);
        setMarker(() => mod.Marker);
      });
    }
  }, []);

  const s = styles(theme);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {hasLocation && Platform.OS !== 'web' && MapView && Marker && (
        <MapView
          style={s.miniMap}
          initialRegion={{ latitude: task.latitude, longitude: task.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
          scrollEnabled={false} zoomEnabled={false}
        >
          <Marker coordinate={{ latitude: task.latitude, longitude: task.longitude }} pinColor={priority.color} />
        </MapView>
      )}

      {hasLocation && Platform.OS !== 'web' && (!MapView || !Marker) && (
        <View style={s.mapLoading}><ActivityIndicator color={theme.primary} /></View>
      )}

      <View style={s.card}>
        <View style={s.statusRow}>
          <Ionicons
            name={task.concluida ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={task.concluida ? theme.success : theme.textMuted}
          />
          <Text style={[s.statusText, task.concluida && { color: theme.success }]}>
            {task.concluida ? 'Concluída' : 'Pendente'}
          </Text>
          <View style={[s.badge, { backgroundColor: priority.bg }]}>
            <Text style={[s.badgeText, { color: priority.color }]}>{priority.label}</Text>
          </View>
        </View>

        <Text style={[s.title, task.concluida && s.titleDone]}>{task.titulo}</Text>

        {task.descricao ? (
          <><Text style={s.sectionLabel}>Descrição</Text>
          <Text style={s.description}>{task.descricao}</Text></>
        ) : null}

        {task.nome_local ? (
          <><Text style={s.sectionLabel}>Local</Text>
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={16} color={theme.textMuted} />
            <Text style={s.locationText}>{task.nome_local}</Text>
          </View></>
        ) : null}

        {hasLocation ? (
          <Text style={s.coords}>{task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}</Text>
        ) : null}

        <Text style={s.sectionLabel}>Criada em</Text>
        <Text style={s.date}>
          {new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>

        <TouchableOpacity style={s.editButton} onPress={() => navigation.navigate('TaskForm', { task })}>
          <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
          <Text style={s.editButtonText}>Editar tarefa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingBottom: 40 },
  miniMap: { width: '100%', height: 200 },
  mapLoading: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface },
  card: { margin: 16, backgroundColor: theme.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.cardBorder },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusText: { fontSize: 14, color: theme.textMuted, fontWeight: '500', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 16 },
  titleDone: { color: theme.textMuted, textDecorationLine: 'line-through' },
  sectionLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600', marginTop: 14, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 15, color: theme.textSecondary, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 14, color: theme.textSecondary },
  coords: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  date: { fontSize: 14, color: theme.textSecondary },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 10, backgroundColor: theme.primary, marginTop: 24 },
  editButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});