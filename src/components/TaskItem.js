import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIORITY_CONFIG = {
  alta: { label: 'Alta', color: '#E55353', bg: '#FDEAEA' },
  media: { label: 'Média', color: '#E0A800', bg: '#FFF6E0' },
  baixa: { label: 'Baixa', color: '#2F80ED', bg: '#E8F0FE' },
};

const PRIORITY_CONFIG_DARK = {
  alta: { label: 'Alta', color: '#FF6B6B', bg: '#2A1A1A' },
  media: { label: 'Média', color: '#FFB300', bg: '#2A2000' },
  baixa: { label: 'Baixa', color: '#4D9FFF', bg: '#1A2A3A' },
};

export default function TaskItem({ task, onToggle, onEdit, onDelete, theme }) {
  const config = theme?.dark ? PRIORITY_CONFIG_DARK : PRIORITY_CONFIG;
  const priority = config[task.prioridade] || config.media;

  return (
    <View style={[s.card(theme), task.concluida && s.cardDone(theme)]}>
      <TouchableOpacity style={s.checkbox} onPress={() => onToggle(task)}>
        <Ionicons
          name={task.concluida ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={task.concluida ? (theme?.success || '#34A853') : (theme?.textMuted || '#C4C8CC')}
        />
      </TouchableOpacity>

      <View style={s.content}>
        <Text style={[s.title(theme), task.concluida && s.titleDone(theme)]} numberOfLines={2}>
          {task.titulo}
        </Text>
        {task.descricao ? (
          <Text style={s.description(theme)} numberOfLines={2}>{task.descricao}</Text>
        ) : null}
        <View style={s.metaRow}>
          <View style={[s.badge, { backgroundColor: priority.bg }]}>
            <Text style={[s.badgeText, { color: priority.color }]}>{priority.label}</Text>
          </View>
          {task.nome_local ? (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={14} color={theme?.textMuted || '#9AA0A6'} />
              <Text style={s.locationText(theme)} numberOfLines={1}>{task.nome_local}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity onPress={() => onEdit(task)} style={s.actionButton}>
          <Ionicons name="pencil-outline" size={20} color={theme?.textMuted || '#9AA0A6'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(task)} style={s.actionButton}>
          <Ionicons name="trash-outline" size={20} color={theme?.danger || '#E55353'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = {
  card: (theme) => ({
    flexDirection: 'row',
    backgroundColor: theme?.card || '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme?.cardBorder || '#EEF0F2',
    alignItems: 'flex-start',
  }),
  cardDone: (theme) => ({
    backgroundColor: theme?.surface || '#FAFAFA',
  }),
  checkbox: { marginRight: 10, marginTop: 2 },
  content: { flex: 1 },
  title: (theme) => ({
    fontSize: 15,
    fontWeight: '600',
    color: theme?.text || '#1A1A1A',
  }),
  titleDone: (theme) => ({
    color: theme?.textMuted || '#9AA0A6',
    textDecorationLine: 'line-through',
  }),
  description: (theme) => ({
    fontSize: 13,
    color: theme?.textSecondary || '#6B7076',
    marginTop: 2,
  }),
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', maxWidth: 160 },
  locationText: (theme) => ({
    fontSize: 12,
    color: theme?.textMuted || '#9AA0A6',
    marginLeft: 2,
  }),
  actions: { marginLeft: 8, alignItems: 'center', gap: 12 },
  actionButton: { padding: 2 },
};