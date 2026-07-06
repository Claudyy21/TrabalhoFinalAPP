import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createTask, updateTask, deleteTask } from '../../database/tasks';

const PRIORITY_OPTIONS = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

export default function TaskFormScreen({ navigation, route }) {
  const { theme } = useTheme();
  const editingTask = route?.params?.task ?? null;
  const isEditing = !!editingTask;

  const [titulo, setTitulo] = useState(editingTask?.titulo ?? '');
  const [descricao, setDescricao] = useState(editingTask?.descricao ?? '');
  const [prioridade, setPrioridade] = useState(editingTask?.prioridade ?? 'media');
  const [nomeLocal, setNomeLocal] = useState(editingTask?.nome_local ?? '');
  const [latitude, setLatitude] = useState(editingTask?.latitude ?? null);
  const [longitude, setLongitude] = useState(editingTask?.longitude ?? null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [MapViewComp, setMapViewComp] = useState(null);
  const [MarkerComp, setMarkerComp] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((mod) => {
        setMapViewComp(() => mod.default);
        setMarkerComp(() => mod.Marker);
      });
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!titulo.trim()) newErrors.titulo = 'Informe um título para a tarefa.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(), descricao: descricao.trim() || null,
        prioridade, nome_local: nomeLocal.trim() || null, latitude, longitude,
      };
      if (isEditing) await updateTask(editingTask.id, payload);
      else await createTask(payload);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar a tarefa.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Tem certeza que deseja excluir "${editingTask.titulo}"?`)
      : await new Promise((resolve) =>
          Alert.alert('Excluir tarefa', `Tem certeza que deseja excluir "${editingTask.titulo}"?`, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
          ])
        );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteTask(editingTask.id);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível excluir a tarefa.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à localização.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      if (!nomeLocal.trim()) {
        setNomeLocal(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
    } finally {
      setLocating(false);
    }
  };

  const handleClearLocation = () => { setLatitude(null); setLongitude(null); setNomeLocal(''); };

  const s = styles(theme);

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{isEditing ? 'Editar tarefa' : 'Nova tarefa'}</Text>

        <Text style={s.label}>Título</Text>
        <TextInput
          style={[s.input, errors.titulo && s.inputError]}
          value={titulo} onChangeText={setTitulo}
          placeholder="Ex: Comprar materiais" placeholderTextColor={theme.placeholder}
          editable={!saving && !deleting}
        />
        {errors.titulo ? <Text style={s.errorText}>{errors.titulo}</Text> : null}

        <Text style={s.label}>Descrição</Text>
        <TextInput
          style={[s.input, s.textArea]} value={descricao} onChangeText={setDescricao}
          placeholder="Detalhes da tarefa (opcional)" placeholderTextColor={theme.placeholder}
          multiline numberOfLines={4} editable={!saving && !deleting}
        />

        <Text style={s.label}>Prioridade</Text>
        <View style={s.priorityRow}>
          {PRIORITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[s.priorityOption, prioridade === opt.value && s.priorityOptionActive]}
              onPress={() => setPrioridade(opt.value)}
              disabled={saving || deleting}
            >
              <Text style={[s.priorityOptionText, prioridade === opt.value && s.priorityOptionTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Local (opcional)</Text>
        <TextInput
          style={s.input} value={nomeLocal} onChangeText={setNomeLocal}
          placeholder="Ex: Mercado, Escritório..." placeholderTextColor={theme.placeholder}
          editable={!saving && !deleting}
        />

        <View style={s.locationActions}>
          <TouchableOpacity style={s.locationButton} onPress={handleUseLocation} disabled={locating || saving || deleting}>
            {locating ? <ActivityIndicator size="small" color={theme.primary} /> : (
              <>
                <Ionicons name="locate-outline" size={16} color={theme.primary} />
                <Text style={s.locationButtonText}>Usar localização atual</Text>
              </>
            )}
          </TouchableOpacity>
          {latitude != null && longitude != null ? (
            <TouchableOpacity onPress={handleClearLocation} disabled={saving || deleting}>
              <Text style={s.clearLocationText}>Remover</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {Platform.OS !== 'web' && MapViewComp && MarkerComp && latitude != null && longitude != null && (
          <View style={s.mapContainer}>
            <MapViewComp
              style={s.miniMap}
              region={{ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
            >
              <MarkerComp
                coordinate={{ latitude, longitude }}
                draggable
                onDragEnd={(e) => {
                  setLatitude(e.nativeEvent.coordinate.latitude);
                  setLongitude(e.nativeEvent.coordinate.longitude);
                  setNomeLocal(`${e.nativeEvent.coordinate.latitude.toFixed(5)}, ${e.nativeEvent.coordinate.longitude.toFixed(5)}`);
                }}
              />
            </MapViewComp>
            <Text style={s.mapHint}>Arraste o pin para ajustar a posição</Text>
          </View>
        )}

        {latitude != null && longitude != null ? (
          <Text style={s.coordsText}>{latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>
        ) : null}

        <TouchableOpacity
          style={[s.saveButton, (saving || deleting) && s.buttonDisabled]}
          onPress={handleSave} disabled={saving || deleting}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : (
            <Text style={s.saveButtonText}>{isEditing ? 'Salvar alterações' : 'Criar tarefa'}</Text>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <TouchableOpacity
            style={[s.deleteButton, (saving || deleting) && s.buttonDisabled]}
            onPress={handleDelete} disabled={saving || deleting}
          >
            {deleting ? <ActivityIndicator color={theme.danger} /> : (
              <Text style={s.deleteButtonText}>Excluir tarefa</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 20 },
  label: { fontSize: 13, color: theme.textMuted, marginBottom: 6, marginTop: 14 },
  input: {
    height: 44, borderRadius: 8, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.surfaceBorder,
    paddingHorizontal: 14, fontSize: 15, color: theme.text,
  },
  textArea: { height: 100, paddingTop: 10, textAlignVertical: 'top' },
  inputError: { borderColor: theme.danger },
  errorText: { color: theme.danger, fontSize: 12, marginTop: 4 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityOption: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceBorder, alignItems: 'center',
  },
  priorityOptionActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  priorityOptionText: { fontSize: 14, fontWeight: '600', color: theme.textSecondary },
  priorityOptionTextActive: { color: '#FFFFFF' },
  locationActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  locationButtonText: { color: theme.primary, fontSize: 13, fontWeight: '600' },
  clearLocationText: { color: theme.danger, fontSize: 13, fontWeight: '600' },
  mapContainer: { marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.surfaceBorder },
  miniMap: { width: '100%', height: 180 },
  mapHint: { fontSize: 12, color: theme.textMuted, textAlign: 'center', paddingVertical: 6, backgroundColor: theme.surface },
  coordsText: { marginTop: 4, fontSize: 12, color: theme.textMuted },
  saveButton: {
    height: 48, borderRadius: 10, backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 28,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    height: 48, borderRadius: 10, backgroundColor: theme.dangerLight,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
  },
  deleteButtonText: { color: theme.danger, fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
});