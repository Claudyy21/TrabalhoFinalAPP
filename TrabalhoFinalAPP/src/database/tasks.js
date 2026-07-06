import { supabase } from './supabase';

/**
 * @param {{ prioridade?: 'alta'|'media'|'baixa'|null, status?: 'pendentes'|'concluidas'|null }} filters
 */
export async function fetchTasks(filters = {}) {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.prioridade) {
    query = query.eq('prioridade', filters.prioridade);
  }

  if (filters.status === 'pendentes') {
    query = query.eq('concluida', false);
  } else if (filters.status === 'concluidas') {
    query = query.eq('concluida', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}


export async function createTask(task) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userData.user.id,
      titulo: task.titulo,
      descricao: task.descricao || null,
      prioridade: task.prioridade || 'media',
      concluida: task.concluida ?? false,
      latitude: task.latitude ?? null,
      longitude: task.longitude ?? null,
      nome_local: task.nome_local || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function updateTask(id, changes) {
  const { data, error } = await supabase
    .from('tasks')
    .update(changes)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function toggleTaskCompleted(id, concluida) {
  return updateTask(id, { concluida });
}


export async function deleteTask(id) {
  const { error, count } = await supabase
    .from('tasks')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) throw error;

  if (count === 0) {
    throw new Error('Tarefa não encontrada ou sem permissão para excluir.');
  }
}
