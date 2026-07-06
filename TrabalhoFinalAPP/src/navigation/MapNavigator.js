import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import MapScreen from '../screens/app/MapScreen';
import TaskDetailScreen from '../screens/app/TaskDetailScreen';
import TaskFormScreen from '../screens/app/TaskFormScreen';

const Stack = createNativeStackNavigator();

export default function MapNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.header },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.text },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="MapMain" component={MapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detalhe da tarefa' }} />
      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({
          title: route.params?.task ? 'Editar tarefa' : 'Nova tarefa',
        })}
      />
    </Stack.Navigator>
  );
}