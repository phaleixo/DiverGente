import supabase, { auth } from '@/config/supabase';

type RawTask = {
  id: number | string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
  dueDate?: string | null;
};

async function getCurrentUser() {
  // Try v2 method
  try {
    if ((auth as any).getUser) {
      const { data } = await (auth as any).getUser();
      return data?.user ?? null;
    }
  } catch (e) {
    // ignore
  }
  // Fallback to v1
  try {
    if ((auth as any).user) {
      return (auth as any).user() ?? null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export async function fetchTasks() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertTask(task: RawTask) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const payload = {
    id: task.id.toString(),
    text: task.text,
    completed: task.completed,
    created_at: task.createdAt,
    completed_at: task.completedAt || null,
    due_date: task.dueDate || null,
    user_id: user.id,
  };
  const { data, error } = await supabase.from('tasks').upsert(payload, { onConflict: 'id' }).select();
  return { data, error };
}

export async function deleteTask(taskId: number | string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase.from('tasks').delete().eq('id', taskId.toString()).eq('user_id', user.id);
  return { data, error };
}

// Diary / emotions
type RawDiary = {
  id: number | string;
  text: string;
  createdAt: string;
  emotion?: string | null;
};

// Decisions
type RawDecision = {
  id: number | string;
  problem: string;
  positivePoints: Array<{ id: string; text: string; rating: number }> | null;
  negativePoints: Array<{ id: string; text: string; rating: number }> | null;
  reflection?: string | null;
  overallSentiment?: string | null;
  createdAt: string;
};

// Calendar events
type RawEvent = {
  id: number | string;
  date: string; // yyyy-mm-dd
  text: string;
  color: string;
};

export async function fetchEvents() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });
  return { data, error };
}

export async function upsertEvent(event: RawEvent) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const payload = {
    id: event.id.toString(),
    date: event.date,
    text: event.text,
    color: event.color,
    user_id: user.id,
  };
  const { data, error } = await supabase.from('events').upsert(payload, { onConflict: 'id' }).select();
  return { data, error };
}

export async function deleteEvent(eventId: number | string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase.from('events').delete().eq('id', eventId.toString()).eq('user_id', user.id);
  return { data, error };
}

export async function fetchDiaryEntries() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertDiaryEntry(entry: RawDiary) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const payload = {
    id: entry.id.toString(),
    text: entry.text,
    created_at: entry.createdAt,
    emotion: entry.emotion || null,
    user_id: user.id,
  };
  const { data, error } = await supabase.from('diary_entries').upsert(payload, { onConflict: 'id' }).select();
  return { data, error };
}

export async function deleteDiaryEntry(entryId: number | string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase.from('diary_entries').delete().eq('id', entryId.toString()).eq('user_id', user.id);
  return { data, error };
}

export async function fetchDecisions() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertDecision(decision: RawDecision) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const payload = {
    id: decision.id.toString(),
    problem: decision.problem,
    positive_points: decision.positivePoints ? JSON.stringify(decision.positivePoints) : null,
    negative_points: decision.negativePoints ? JSON.stringify(decision.negativePoints) : null,
    reflection: decision.reflection || null,
    overall_sentiment: decision.overallSentiment || null,
    created_at: decision.createdAt,
    user_id: user.id,
  };

  // If your DB expects jsonb columns, supply parsed objects instead of strings.
  // Supabase client will convert JS objects to JSON automatically, so prefer using the arrays directly.
  const payloadBetter = {
    id: decision.id.toString(),
    problem: decision.problem,
    positive_points: decision.positivePoints ?? null,
    negative_points: decision.negativePoints ?? null,
    reflection: decision.reflection || null,
    overall_sentiment: decision.overallSentiment || null,
    created_at: decision.createdAt,
    user_id: user.id,
  };

  const { data, error } = await supabase.from('decisions').upsert(payloadBetter, { onConflict: 'id' }).select();
  return { data, error };
}

export async function deleteDecision(decisionId: number | string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error('No user') };
  const { data, error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', decisionId.toString())
    .eq('user_id', user.id);
  return { data, error };
}

// Enviar email de redefinição de senha
export async function sendPasswordResetEmail(email: string) {
  try {
    // Supabase V2
    if ((auth as any).resetPasswordForEmail) {
      const res = await (auth as any).resetPasswordForEmail(email);
      return res;
    }

    // Fallback para clientes antigos
    if ((auth as any).api && (auth as any).api.resetPasswordForEmail) {
      const res = await (auth as any).api.resetPasswordForEmail(email);
      return res;
    }

    return { error: new Error('resetPasswordForEmail não suportado pelo cliente Supabase') };
  } catch (err: any) {
    return { error: err };
  }
}

export default {
  fetchTasks,
  upsertTask,
  deleteTask,
  fetchEvents,
  upsertEvent,
  deleteEvent,
  fetchDiaryEntries,
  upsertDiaryEntry,
  deleteDiaryEntry,
  fetchDecisions,
  upsertDecision,
  deleteDecision,
  sendPasswordResetEmail,
};
