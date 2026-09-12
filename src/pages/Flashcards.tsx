import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { flashcards, flashcardTopics } from '@/data/flashcards';
import type { Flashcard } from '@/data/flashcards';
import {
  Layers, RotateCw, Check, X, ChevronLeft, ChevronRight, Brain, Clock, TrendingUp,
} from 'lucide-react';

type CardStatus = 'new' | 'learning' | 'mastered';

interface ProgressMap {
  [cardId: string]: { status: CardStatus; review_count: number; last_reviewed_at: string | null };
}

export default function Flashcards() {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [progress, setProgress] = useState<ProgressMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const filteredCards =
    selectedTopic === 'all'
      ? flashcards
      : flashcards.filter((c: Flashcard) => c.topic === selectedTopic);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('flashcard_progress')
      .select('flashcard_id, status, review_count, last_reviewed_at')
      .eq('user_id', user.id);
    const map: ProgressMap = {};
    if (data) {
      data.forEach((r) => {
        map[r.flashcard_id] = {
          status: r.status as CardStatus,
          review_count: r.review_count,
          last_reviewed_at: r.last_reviewed_at,
        };
      });
    }
    setProgress(map);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
  }, [selectedTopic]);

  const updateCardStatus = async (cardId: string, gotItRight: boolean) => {
    const current = progress[cardId] ?? { status: 'new', review_count: 0, last_reviewed_at: null };
    const newCount = current.review_count + 1;
    let newStatus: CardStatus = current.status;

    if (gotItRight) {
      if (current.status === 'new') newStatus = 'learning';
      else if (current.status === 'learning') newStatus = 'mastered';
    } else {
      newStatus = 'new';
    }

    setProgress((prev) => ({
      ...prev,
      [cardId]: { status: newStatus, review_count: newCount, last_reviewed_at: new Date().toISOString() },
    }));

    if (user) {
      const existing = progress[cardId];
      if (existing) {
        await supabase
          .from('flashcard_progress')
          .update({
            status: newStatus,
            review_count: newCount,
            last_reviewed_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('flashcard_id', cardId);
      } else {
        await supabase.from('flashcard_progress').insert({
          user_id: user.id,
          flashcard_id: cardId,
          status: newStatus,
          review_count: newCount,
          last_reviewed_at: new Date().toISOString(),
        });
      }
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((i) => (i + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((i) => (i - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleRate = (gotItRight: boolean) => {
    const card = filteredCards[currentIndex];
    if (!card) return;
    updateCardStatus(card.id, gotItRight);
    setTimeout(handleNext, 300);
  };

  const currentCard = filteredCards[currentIndex];
  const cardProgress = currentCard ? progress[currentCard.id] : undefined;

  const masteredCount = Object.values(progress).filter((p) => p.status === 'mastered').length;
  const learningCount = Object.values(progress).filter((p) => p.status === 'learning').length;
  const newCount = flashcards.length - masteredCount - learningCount;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Layers className="h-8 w-8 text-blue-600" />
            Domain-Specific Flashcards
          </h1>
          <p className="mt-1 text-gray-600">
            Study key concepts from India's Official Statistical System with spaced-repetition flashcards.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{newCount}</p>
              <p className="text-sm text-gray-500">New</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{learningCount}</p>
              <p className="text-sm text-gray-500">Learning</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{masteredCount}</p>
              <p className="text-sm text-gray-500">Mastered</p>
            </div>
          </div>
        </div>

        {/* Topic filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedTopic === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            All Topics
          </button>
          {flashcardTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedTopic === topic
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Flashcard */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : currentCard ? (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {currentCard.topic}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
              />
            </div>

            {/* Card */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="group relative h-72 cursor-pointer [perspective:1000px]"
            >
              <div
                className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  flipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-lg [backface-visibility:hidden]">
                  <span className="absolute left-4 top-4 text-xs font-semibold text-blue-600">
                    QUESTION
                  </span>
                  <p className="text-center text-xl font-semibold text-gray-900">
                    {currentCard.front}
                  </p>
                  <p className="absolute bottom-4 text-xs text-gray-400">Click to flip</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="absolute left-4 top-4 text-xs font-semibold text-cyan-300">
                    ANSWER
                  </span>
                  <p className="text-center text-lg leading-relaxed">{currentCard.back}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {flipped ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRate(false)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-100 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                  >
                    <X className="h-4 w-4" /> Need Practice
                  </button>
                  <button
                    onClick={() => handleRate(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                  >
                    <Check className="h-4 w-4" /> Got It
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFlipped(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <RotateCw className="h-4 w-4" /> Flip Card
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card status */}
            {cardProgress && (
              <p className="mt-3 text-center text-xs text-gray-500">
                Status: <span className="font-semibold capitalize">{cardProgress.status}</span> •
                Reviewed {cardProgress.review_count} time(s)
              </p>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">
            <Layers className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p>No flashcards in this topic yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
