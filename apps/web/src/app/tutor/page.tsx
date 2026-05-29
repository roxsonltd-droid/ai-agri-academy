'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Send, Bot, User, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import AnimatedDebateTimeline from '@/components/AnimatedDebateTimeline';
import { TutorProgressDashboard } from '@/components/tutor/TutorProgressDashboard';

type AcademySource = { source?: string; topic?: string; course?: string };

type DeepDebateApiResponse = {
  debate_history?: unknown[];
  final_answer?: string;
  consensus_level?: string;
  sources?: AcademySource[];
};

type TeachResponse = {
  variant?: string;
  lesson?: string;
  topic?: string;
  difficulty?: string | null;
  mastery_level?: number | null;
  ab_test_active?: boolean;
  requested_mode?: string;
  sources?: AcademySource[];
  recommended_next?: unknown;
};

function asDebatePayload(data: unknown): DeepDebateApiResponse {
  return data && typeof data === 'object' ? (data as DeepDebateApiResponse) : {};
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isDebate?: boolean;
  debateData?: unknown;
  sources?: AcademySource[];
}

export default function TutorChat() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'chat' | 'lesson'>('chat');
  const [topic, setTopic] = useState('');
  const [teachMode, setTeachMode] = useState<'auto' | 'adaptive' | 'static'>('auto');
  const [teachLoading, setTeachLoading] = useState(false);
  const [teachResult, setTeachResult] = useState<TeachResponse | null>(null);
  const [teachError, setTeachError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<[boolean | null, boolean | null, boolean | null]>([null, null, null]);
  const [assessMsg, setAssessMsg] = useState<string | null>(null);

  const userId = user?.id ?? 'anonymous';

  useEffect(() => {
    if (user) {
      supabase
        .from('farm_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data as Record<string, unknown>);
            setMessages([
              {
                id: '1',
                role: 'ai',
                content: `Здравейте, ${(data as { full_name?: string }).full_name?.split(' ')[0] || 'Фермер'}! Аз съм AgriNexus Tutor. 🌾\nМога да ви помогна с бързи съвети, урок по тема (адаптивен или статичен), или Deep Analysis.`,
              },
            ]);
          } else {
            setProfile(null);
            setMessages([
              {
                id: '1',
                role: 'ai',
                content:
                  'Здравейте! Аз съм AgriNexus Tutor. Добавете профил на стопанството в onboarding за по-богат контекст, или питайте директно като гост.',
              },
            ]);
          }
        });
    } else {
      setProfile(null);
      setMessages([
        {
          id: '1',
          role: 'ai',
          content: 'Влезте с акаунт за пълен профил и история, или ползвайте бързи въпроси като гост (ограничен контекст).',
        },
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (isDeepAnalysis: boolean) => {
    if (!input.trim() || loading) return;

    const newMsgId = Date.now().toString();
    const userMsg: ChatMessage = { id: newMsgId, role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = isDeepAnalysis ? '/api/tutor/deep-debate' : '/api/tutor/chat';
      const uid = user?.id ?? 'anonymous';

      const payload = isDeepAnalysis
        ? {
            question: userMsg.content,
            userId: uid,
            culture: (profile?.cultures as string[] | undefined)?.[0] || '',
            region: (profile?.region as string) || '',
            useDebate: true,
          }
        : {
            question: userMsg.content,
            userId: uid,
            culture: (profile?.cultures as string[] | undefined)?.[0] || '',
            region: (profile?.region as string) || '',
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Грешка при връзка с бекенда');

      const data = await res.json();

      if (isDeepAnalysis) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'ai',
            content: '',
            isDebate: true,
            debateData: data,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'ai',
            content: typeof data.answer === 'string' ? data.answer : '',
            sources: Array.isArray(data.sources) ? data.sources : [],
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          content:
            'Възникна грешка при свързване с AgriNexus AI. Стартирайте FastAPI (`npm run dev:backend`) и задайте `API_URL` в `apps/web/.env.local` за прокси към `/api/tutor/*`.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runTeach = async () => {
    const t = topic.trim();
    if (!t || teachLoading) return;
    setTeachLoading(true);
    setTeachError(null);
    setTeachResult(null);
    setAssessMsg(null);
    setQuiz([null, null, null]);
    try {
      const cultures = (profile?.cultures as string[] | undefined) || [];
      const res = await fetch('/api/tutor/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic: t,
          tutor_mode: teachMode,
          culture: cultures[0] || undefined,
          cultures: cultures.length ? cultures : undefined,
          region: (profile?.region as string) || undefined,
          experience: (profile?.experience as string) || 'intermediate',
          farm_size_ha: typeof profile?.farm_size_ha === 'number' ? profile.farm_size_ha : undefined,
        }),
      });
      const data = (await res.json()) as TeachResponse & { detail?: string };
      if (!res.ok) {
        setTeachError(typeof data.detail === 'string' ? data.detail : `HTTP ${res.status}`);
        return;
      }
      setTeachResult(data);
    } catch {
      setTeachError('Мрежова грешка');
    } finally {
      setTeachLoading(false);
    }
  };

  const submitAssess = async () => {
    if (quiz.some((x) => x === null) || !teachResult?.topic) {
      setAssessMsg('Маркирайте отговор и за трите въпроса (примерна самопроверка).');
      return;
    }
    const answers = quiz.map((x) => Boolean(x)) as boolean[];
    const recordMastery = teachResult.variant === 'adaptive';
    try {
      const res = await fetch('/api/tutor/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic: teachResult.topic,
          answers,
          record_mastery: recordMastery,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssessMsg(typeof data.detail === 'string' ? data.detail : 'Оценката не бе приета.');
        return;
      }
      setAssessMsg(
        typeof data.feedback === 'string'
          ? `${data.feedback}${data.recorded === false ? ' (без запис в БД — статичен урок)' : ''}`
          : 'Готово.',
      );
      window.dispatchEvent(new Event('tutor-progress-refresh'));
    } catch {
      setAssessMsg('Грешка при изпращане на оценката.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pt-16 dark:bg-slate-950">
      <header className="z-10 flex flex-wrap items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <Bot size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">AgriNexus Tutor</h1>
          <p className="flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Онлайн и в готовност
          </p>
        </div>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setView('chat')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium sm:flex-none ${
              view === 'chat'
                ? 'bg-emerald-600 text-white shadow dark:bg-emerald-500'
                : 'border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <MessageCircle size={18} /> Чат
          </button>
          <button
            type="button"
            onClick={() => setView('lesson')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium sm:flex-none ${
              view === 'lesson'
                ? 'bg-emerald-600 text-white shadow dark:bg-emerald-500'
                : 'border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <BookOpen size={18} /> Урок по тема
          </button>
        </div>
      </header>

      {view === 'lesson' ? (
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80 sm:p-6">
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">Урок + A/B (Adaptive vs Static)</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Режим <strong>auto</strong>: при включен <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">FEATURE_TUTOR_AB_TEST</code> на
              сървъра потребителят се разпределя стабилно между адаптивен и статичен tutor. Иначе по подразбиране се ползва адаптивният, ако е
              включен.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">Тема</span>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="напр. торене_пшеница"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <label className="text-sm sm:w-48">
                <span className="text-slate-600 dark:text-slate-400">Режим</span>
                <select
                  value={teachMode}
                  onChange={(e) => setTeachMode(e.target.value as typeof teachMode)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="auto">auto (A/B ако е настроен)</option>
                  <option value="adaptive">adaptive</option>
                  <option value="static">static</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => void runTeach()}
                disabled={teachLoading || !topic.trim()}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white shadow disabled:opacity-50"
              >
                {teachLoading ? '…' : 'Генерирай урок'}
              </button>
            </div>
            {teachError ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{teachError}</p> : null}
          </div>

          {teachResult ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    teachResult.variant === 'adaptive'
                      ? 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  }`}
                >
                  {teachResult.variant === 'adaptive' ? 'Adaptive' : 'Static'}
                </span>
                {teachResult.ab_test_active ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                    A/B активен
                  </span>
                ) : null}
                {teachResult.difficulty ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100">
                    трудност: {teachResult.difficulty}
                  </span>
                ) : null}
                {typeof teachResult.mastery_level === 'number' ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    mastery: {(teachResult.mastery_level * 100).toFixed(0)}%
                  </span>
                ) : null}
              </div>
              <div className="prose prose-slate mt-4 max-w-none whitespace-pre-wrap dark:prose-invert">{teachResult.lesson || ''}</div>
              {teachResult.sources && teachResult.sources.length > 0 ? (
                <div className="mt-4 border-t border-slate-200 pt-3 dark:border-white/10">
                  <p className="text-xs font-semibold uppercase text-slate-500">Източници (static)</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {teachResult.sources.map((s, i) => (
                      <li key={i}>
                        {s.topic ? <span className="font-medium">{s.topic}</span> : null}
                        {s.source ? <span className="text-slate-500"> — {s.source}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Бърза самопроверка (3 отговора)</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Маркирайте дали смятате, че сте отговорили вярно на въпросите от урока (примерно). При <strong>Adaptive</strong> резултатът се
                  записва към mastery.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Въпрос {i + 1}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setQuiz((q) => {
                            const n = [...q] as [boolean | null, boolean | null, boolean | null];
                            n[i] = true;
                            return n;
                          })}
                          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                            quiz[i] === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          Вярно
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuiz((q) => {
                            const n = [...q] as [boolean | null, boolean | null, boolean | null];
                            n[i] = false;
                            return n;
                          })}
                          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                            quiz[i] === false ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          Грешно
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void submitAssess()}
                  className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Изпрати оценка
                </button>
                {assessMsg ? <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">{assessMsg}</p> : null}
              </div>
            </div>
          ) : null}

          <TutorProgressDashboard userId={userId} />
        </main>
      ) : (
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {messages.map((msg) => {
            const debatePayload = msg.isDebate && msg.debateData ? asDebatePayload(msg.debateData) : null;
            return (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                  }`}
                >
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div
                  className={`max-w-[min(85vw,42rem)] rounded-2xl p-5 text-[15.5px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-md dark:bg-blue-600'
                      : 'border border-slate-200/80 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100'
                  }`}
                >
                  {debatePayload ? (
                    <AnimatedDebateTimeline
                      debateHistory={Array.isArray(debatePayload.debate_history) ? debatePayload.debate_history : []}
                      finalAnswer={debatePayload.final_answer}
                      consensusLevel={debatePayload.consensus_level}
                      academySources={Array.isArray(debatePayload.sources) ? debatePayload.sources : []}
                    />
                  ) : (
                    <div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.sources && msg.sources.length > 0 ? (
                        <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-white/10">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Academy източници</p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">
                            {msg.sources.map((s, i) => (
                              <li key={`${s.source ?? i}-${i}`}>
                                {s.topic ? <span className="font-medium">{s.topic}</span> : null}
                                {s.source ? <span className="text-slate-500"> — {s.source}</span> : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Bot size={20} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400"></div>
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0.4s' }}></div>
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Агентите мислят...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>
      )}

      {view === 'chat' ? (
        <div className="z-10 border-t border-slate-200/90 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:p-6">
          <div className="relative mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && void sendMessage(false)}
              placeholder="Напр: Да продавам ли пшеницата сега или да чакам?"
              className="flex-1 rounded-xl border border-slate-200/90 bg-slate-50 px-5 py-4 text-[16px] text-slate-900 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
              disabled={loading}
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => void sendMessage(false)}
                disabled={loading || !input.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-5 py-4 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none sm:px-6"
                title="Бърз отговор"
              >
                <Send size={20} /> <span className="hidden sm:inline">Бърз</span>
              </button>
              <button
                type="button"
                onClick={() => void sendMessage(true)}
                disabled={loading || !input.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 font-bold text-white shadow-md transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 dark:from-emerald-500 dark:to-teal-500 sm:flex-none sm:px-6"
                title="Задълбочен дебат (Market, Risk, Crop & Critic Expert)"
              >
                <Sparkles size={20} className="animate-pulse" />
                <span>Deep Analysis</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
