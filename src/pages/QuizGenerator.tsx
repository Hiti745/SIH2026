import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateQuizFromText, type GeneratedQuestion } from '@/lib/quizGenerator';
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react';

type Phase = 'input' | 'generating' | 'quiz' | 'results';

interface SavedQuiz {
  id: string;
  title: string;
  created_at: string;
  question_count: number;
}

const sampleTexts = [
  {
    title: 'Sampling Methods',
    text: `Sampling is a fundamental concept in statistics that involves selecting a subset of individuals from a population to estimate the characteristics of the whole population. The two main types of sampling are probability sampling and non-probability sampling. In probability sampling, every unit in the population has a known and non-zero chance of being selected. Simple random sampling is the most basic form where each unit has an equal probability of selection. Stratified sampling divides the population into homogeneous groups called strata and then samples from each stratum. Cluster sampling divides the population into clusters and then randomly selects entire clusters. Systematic sampling selects every kth element from a list after a random start. The sampling frame is the list of all units in the population from which the sample is drawn. Sample size determination is crucial for ensuring the reliability of estimates. A larger sample size reduces the margin of error and increases the precision of estimates.`,
  },
  {
    title: 'Hypothesis Testing',
    text: `Hypothesis testing is a statistical method used to make decisions about population parameters based on sample data. The null hypothesis states that there is no significant difference or relationship, while the alternative hypothesis states the opposite. The p-value is the probability of obtaining results at least as extreme as the observed results, assuming the null hypothesis is true. A type I error occurs when we reject a true null hypothesis, while a type II error occurs when we fail to reject a false null hypothesis. The significance level, denoted by alpha, is the threshold below which we reject the null hypothesis. A confidence interval provides a range of values within which the true population parameter is likely to fall. The power of a test is the probability of correctly rejecting a false null hypothesis. Increasing the sample size increases the power of the test.`,
  },
  {
    title: 'Data Collection Methods',
    text: `Data collection is the process of gathering and measuring information on variables of interest. Census is a complete enumeration of all units in a population, while a survey collects data from a sample. A questionnaire is a structured instrument for data collection that consists of a series of questions. Data quality refers to the accuracy, completeness, and reliability of collected data. Metadata is data that describes other data, providing context and meaning. Imputation is the process of replacing missing data with estimated values. Weighting is a technique used to adjust sample data to better represent the population. Data validation ensures that collected data meets specified quality standards. Non-response bias occurs when individuals who do not respond differ systematically from those who do respond.`,
  },
];

export default function QuizGenerator() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('input');
  const [inputText, setInputText] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSavedQuizzes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quizzes')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      const quizzesWithCounts = await Promise.all(
        data.map(async (q) => {
          const { count } = await supabase
            .from('quiz_questions')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', q.id);
          return {
            id: q.id,
            title: q.title,
            created_at: q.created_at,
            question_count: count ?? 0,
          };
        })
      );
      setSavedQuizzes(quizzesWithCounts);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedQuizzes();
  }, [fetchSavedQuizzes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setError('File too large. Please upload a text file under 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInputText(text);
      setQuizTitle(file.name.replace(/\.[^.]+$/, ''));
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (inputText.trim().length < 100) {
      setError('Please provide at least 100 characters of learning material.');
      return;
    }
    setError(null);
    setLoading(true);
    setPhase('generating');

    await new Promise((r) => setTimeout(r, 1200));

    const generated = generateQuizFromText(inputText, numQuestions);
    if (generated.length === 0) {
      setError('Could not generate quiz from the provided text. Please try with more detailed material.');
      setPhase('input');
      setLoading(false);
      return;
    }

    setQuestions(generated);
    setAnswers({});
    setScore(0);
    setLoading(false);
    setPhase('quiz');

    if (user) {
      const title = quizTitle || 'Generated Quiz';
      const { data: quizData } = await supabase
        .from('quizzes')
        .insert({ user_id: user.id, title, source_text: inputText.slice(0, 5000) })
        .select('id')
        .single();
      if (quizData) {
        setActiveQuizId(quizData.id);
        await supabase.from('quiz_questions').insert(
          generated.map((q) => ({
            quiz_id: quizData.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          }))
        );
        fetchSavedQuizzes();
      }
    }
  };

  const handleAnswer = (qIndex: number, answer: string) => {
    if (answers[qIndex]) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correct++;
    });
    setScore(correct);
    setPhase('results');

    if (user && activeQuizId) {
      await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_id: activeQuizId,
        score: correct,
        total_questions: questions.length,
        answers: answers,
      });
    }
  };

  const handleReset = () => {
    setPhase('input');
    setQuestions([]);
    setAnswers({});
    setScore(0);
    setInputText('');
    setQuizTitle('');
    setActiveQuizId(null);
    setError(null);
  };

  const loadSavedQuiz = async (quizId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('quiz_questions')
      .select('id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation')
      .eq('quiz_id', quizId);
    if (data && data.length > 0) {
      setQuestions(data as unknown as GeneratedQuestion[]);
      setAnswers({});
      setScore(0);
      setActiveQuizId(quizId);
      const quiz = savedQuizzes.find((q) => q.id === quizId);
      setQuizTitle(quiz?.title ?? 'Saved Quiz');
      setPhase('quiz');
    }
  };

  const deleteSavedQuiz = async (quizId: string) => {
    if (!user) return;
    await supabase.from('quizzes').delete().eq('id', quizId);
    setSavedQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Sparkles className="h-8 w-8 text-blue-600" />
            AI Quiz Generator
          </h1>
          <p className="mt-1 text-gray-600">
            Upload learning materials or paste text to auto-generate MCQs for practice and assessment.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Input Phase */}
        {phase === 'input' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Step 1: Provide Learning Material</h2>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-12 transition hover:border-blue-500 hover:bg-blue-50"
              >
                <Upload className="mb-3 h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Click to upload a text file</p>
                <p className="text-xs text-gray-500">TXT, MD, or CSV (max 500KB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Or paste text */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Or paste your text below:
                </label>
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your learning material here (minimum 100 characters)..."
                  className="w-full rounded-lg border-2 border-gray-200 p-4 text-sm outline-none transition focus:border-blue-600"
                />
                <p className="mt-1 text-right text-xs text-gray-500">{inputText.length} characters</p>
              </div>

              {/* Sample texts */}
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Or try a sample:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((sample) => (
                    <button
                      key={sample.title}
                      onClick={() => {
                        setInputText(sample.text);
                        setQuizTitle(sample.title);
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm transition hover:border-blue-600 hover:bg-blue-50"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Step 2: Configure Quiz</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g., Sampling Methods Quiz"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-600"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={7}>7 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={inputText.trim().length < 100 || loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                Generate Quiz
              </button>
            </div>

            {/* Saved Quizzes */}
            {savedQuizzes.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Your Saved Quizzes</h2>
                <div className="space-y-3">
                  {savedQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                          <p className="text-xs text-gray-500">
                            {quiz.question_count} questions • {new Date(quiz.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadSavedQuiz(quiz.id)}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Retake <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSavedQuiz(quiz.id)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generating Phase */}
        {phase === 'generating' && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Generating Quiz...</h2>
            <p className="text-gray-500">AI is analyzing your learning material and creating MCQs.</p>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === 'quiz' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{quizTitle}</h2>
                <p className="text-sm text-gray-500">
                  {questions.length} questions • Answered: {Object.keys(answers).length}/{questions.length}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
              >
                <RotateCcw className="h-4 w-4" /> Start Over
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>

            {/* Questions */}
            {questions.map((q, qIdx) => {
              const userAnswer = answers[qIdx];
              return (
                <div key={qIdx} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                      {qIdx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">{q.question_text}</h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(['a', 'b', 'c', 'd'] as const).map((letter) => {
                      const optionText = q[`option_${letter}` as keyof GeneratedQuestion] as string;
                      const isSelected = userAnswer === letter;
                      return (
                        <button
                          key={letter}
                          onClick={() => handleAnswer(qIdx, letter)}
                          disabled={!!userAnswer}
                          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left text-sm transition ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-gray-900'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          } ${userAnswer && userAnswer !== letter ? 'opacity-50' : ''}`}
                        >
                          <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {letter.toUpperCase()}
                          </span>
                          <span className="text-gray-700">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trophy className="h-5 w-5" />
              Submit Quiz
            </button>
          </div>
        )}

        {/* Results Phase */}
        {phase === 'results' && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 p-8 text-center text-white shadow-lg">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-amber-300" />
              <h2 className="mb-2 text-3xl font-bold">Quiz Complete!</h2>
              <p className="text-5xl font-bold">{score}/{questions.length}</p>
              <p className="mt-2 text-lg text-blue-100">
                {score === questions.length
                  ? 'Perfect score! Excellent work!'
                  : score >= questions.length * 0.7
                  ? 'Great job! You scored well.'
                  : 'Keep practicing to improve your score.'}
              </p>
            </div>

            {/* Review Answers */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Review Answers</h3>
              {questions.map((q, qIdx) => {
                const userAnswer = answers[qIdx];
                const isCorrect = userAnswer === q.correct_answer;
                return (
                  <div key={qIdx} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      )}
                      <h4 className="font-semibold text-gray-900">{q.question_text}</h4>
                    </div>
                    <div className="ml-8 space-y-1.5 text-sm">
                      <p className={isCorrect ? 'font-semibold text-emerald-700' : 'text-gray-600'}>
                        Your answer: {userAnswer?.toUpperCase()} — {q[`option_${userAnswer}` as keyof GeneratedQuestion] as string}
                      </p>
                      {!isCorrect && (
                        <p className="font-semibold text-emerald-700">
                          Correct answer: {q.correct_answer.toUpperCase()} — {q[`option_${q.correct_answer}` as keyof GeneratedQuestion] as string}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="mt-2 rounded-lg bg-gray-50 p-3 text-gray-600">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" /> Generate New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
