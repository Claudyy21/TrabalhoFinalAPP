import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const STATUS_OPTIONS = [
  { value: null, label: 'Todas' },
  { value: 'pendentes', label: 'Pendentes' },
  { value: 'concluidas', label: 'Concluídas' },
];

const PRIORITY_OPTIONS = [
  { value: null, label: 'Qualquer prioridade' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

export default function TaskFilters({ status, onStatusChange, prioridade, onPrioridadeChange, theme }) {
  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {STATUS_OPTIONS.map((opt) => (
          <Chip key={`s-${opt.label}`} label={opt.label} active={status === opt.value} onPress={() => onStatusChange(opt.value)} theme={theme} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {PRIORITY_OPTIONS.map((opt) => (
          <Chip key={`p-${opt.label}`} label={opt.label} active={prioridade === opt.value} onPress={() => onPrioridadeChange(opt.value)} theme={theme} />
        ))}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.chip,
        { backgroundColor: active ? (theme?.primary || '#2F80ED') : (theme?.surface || '#F1F2F4'),
          borderColor: active ? (theme?.primary || '#2F80ED') : (theme?.surfaceBorder || '#E3E5E8') }
      ]}
    >
      <Text style={[s.chipText, { color: active ? '#FFFFFF' : (theme?.textSecondary || '#6B7076') }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { gap: 8, marginBottom: 8 },
  row: { gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
});