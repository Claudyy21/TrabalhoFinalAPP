import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import TasksListScreen from '../screens/app/TasksListScreen';
import TaskFormScreen from '../screens/app/TaskFormScreen';
import TaskDetailScreen from '../screens/app/TaskDetailScreen';

const Stack = createNativeStackNavigator();

export default function TasksNavigator() {
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
      <Stack.Screen name="TasksList" component={TasksListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({
          title: route.params?.task ? 'Editar tarefa' : 'Nova tarefa',
          headerBackTitle: 'Voltar',
        })}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalhe da tarefa' }}
      />
    </Stack.Navigator>
  );
}