import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchTasks, toggleTaskCompleted, deleteTask } from '../../database/tasks';
import TaskItem from '../../components/TaskItem';
import TaskFilters from '../../components/TaskFilters';

export default function TasksListScreen({ navigation }) {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [prioridade, setPrioridade] = useState(null);

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks({ status, prioridade });
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status, prioridade]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadTasks({ silent: true }));
    return unsubscribe;
  }, [navigation, loadTasks]);

  const handleRefresh = () => { setRefreshing(true); loadTasks({ silent: true }); };

  const handleToggle = async (task) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, concluida: !t.concluida } : t));
    try {
      await toggleTaskCompleted(task.id, !task.concluida);
    } catch (err) {
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, concluida: task.concluida } : t));
      Alert.alert('Erro', err.message || 'Não foi possível atualizar a tarefa.');
    }
  };

  const handleEdit = (task) => navigation.navigate('TaskForm', { task });

  const handleDelete = async (task) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Tem certeza que deseja excluir "${task.titulo}"?`)
      : await new Promise((resolve) =>
          Alert.alert('Excluir tarefa', `Tem certeza que deseja excluir "${task.titulo}"?`, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
          ])
        );

    if (!confirmed) return;
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível excluir a tarefa.');
    }
  };

  const s = styles(theme);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Tarefas</Text>
        <View style={s.headerButtons}>
          <TouchableOpacity
            style={s.headerButton}
            onPress={() => navigation.getParent()?.navigate('Map', { screen: 'MapMain' })}
          >
            <Ionicons name="map-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.addButton} onPress={() => navigation.navigate('TaskForm')}>
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <TaskFilters
        status={status}
        onStatusChange={setStatus}
        prioridade={prioridade}
        onPrioridadeChange={setPrioridade}
        theme={theme}
      />

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={theme.primary} /></View>
      ) : error ? (
        <View style={s.centered}>
          <Ionicons name="wifi-outline" size={32} color={theme.danger} />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryButton} onPress={() => loadTasks()}>
            <Text style={s.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : tasks.length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="checkbox-outline" size={40} color={theme.textMuted} />
          <Text style={s.emptyText}>Nenhuma tarefa encontrada.</Text>
          <Text style={s.emptySubtext}>Toque no botão "+" para criar sua primeira tarefa.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} theme={theme} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
        />
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: theme.text },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  addButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  errorText: { marginTop: 8, fontSize: 14, color: theme.danger, textAlign: 'center' },
  retryButton: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 8, backgroundColor: theme.primary,
  },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: '600', color: theme.textSecondary, textAlign: 'center' },
  emptySubtext: { marginTop: 4, fontSize: 13, color: theme.textMuted, textAlign: 'center' },
});