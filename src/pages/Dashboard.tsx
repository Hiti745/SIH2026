import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import { skills as defaultSkills, recommendedCourses } from '@/data/courses';
import type { QuizAttempt, CompetencyAssessment, Skill } from '@/types';
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Sparkles,
  FileQuestion,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { enrollments } = useEnrollment();
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [assessments, setAssessments] = useState<CompetencyAssessment[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<{ id: string; title: string; created_at: string }[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    const [attemptsRes, quizzesRes, assessmentsRes] = await Promise.all([
      supabase
        .from('quiz_attempts')
        .select('id, quiz_id, score, total_questions, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('quizzes')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('competency_assessments')
        .select('id, skill_name, score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (attemptsRes.data) setQuizAttempts(attemptsRes.data);
    if (quizzesRes.data) setRecentQuizzes(quizzesRes.data);
    if (assessmentsRes.data) setAssessments(assessmentsRes.data);
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const completedCourses = enrollments.filter((e) => e.status === 'completed').length;
  const inProgressCourses = enrollments.filter((e) => e.status === 'in_progress').length;
  const totalLearningHours = enrollments.length * 20;
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / quizAttempts.length)
    : 0;

  const skillColors: Record<string, string> = {
    'Statistical Analysis': 'bg-emerald-500',
    'Data Visualization': 'bg-blue-500',
    'Survey Methodology': 'bg-emerald-500',
    'Machine Learning': 'bg-amber-500',
    'Python Programming': 'bg-blue-500',
  };

  const displaySkills: Skill[] = assessments.length > 0
    ? assessments.map((a) => ({
        name: a.skill_name,
        level: a.score >= 70 ? `Advanced - ${a.score}%` : a.score >= 50 ? `Intermediate - ${a.score}%` : `Beginner - ${a.score}%`,
        percent: a.score,
        color: skillColors[a.skill_name] ?? 'bg-blue-500',
      }))
    : defaultSkills;

  const strongSkills = displaySkills.filter((s) => s.percent >= 70);
  const weakSkills = displaySkills.filter((s) => s.percent < 60);
  const overallCompetency = displaySkills.length > 0
    ? Math.round(displaySkills.reduce((sum, s) => sum + s.percent, 0) / displaySkills.length)
    : 0;

  const maxScore = Math.max(...displaySkills.map((s) => s.percent), 100);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {profile?.full_name ?? user?.email}. Here's your learning overview.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} value={enrollments.length} label="Courses Enrolled" color="from-blue-600 to-blue-800" />
          <StatCard icon={CheckCircle} value={completedCourses} label="Courses Completed" color="from-emerald-500 to-emerald-700" />
          <StatCard icon={FileQuestion} value={quizAttempts.length} label="Quizzes Taken" color="from-amber-500 to-orange-600" />
          <StatCard icon={Clock} value={`${totalLearningHours}h`} label="Learning Hours" color="from-cyan-500 to-blue-600" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Competency Overview */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Competency Overview</h2>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{overallCompetency}% Overall</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              {displaySkills.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  Take the pre-assessment during sign-up to see your competency scores here.
                </p>
              ) : null}
              {displaySkills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{skill.percent}%</span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${skill.color}`}
                      style={{ width: `${(skill.percent / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Summary */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Strong Areas</h3>
                </div>
                {strongSkills.length > 0 ? (
                  <ul className="space-y-1">
                    {strongSkills.map((s) => (
                      <li key={s.name} className="text-sm text-gray-700">{s.name} ({s.percent}%)</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No strong areas identified yet.</p>
                )}
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Needs Improvement</h3>
                </div>
                {weakSkills.length > 0 ? (
                  <ul className="space-y-1">
                    {weakSkills.map((s) => (
                      <li key={s.name} className="text-sm text-gray-700">{s.name} ({s.percent}%)</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No weak areas detected. Great job!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quiz Performance */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Quiz Performance</h2>
              <div className="flex items-center justify-center">
                <div className="relative h-36 w-36">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="#3b82f6" strokeWidth="8"
                      strokeDasharray={`${(avgQuizScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{avgQuizScore}%</span>
                    <span className="text-xs text-gray-500">Avg Score</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Quizzes</span>
                  <span className="font-semibold text-gray-900">{quizAttempts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best Score</span>
                  <span className="font-semibold text-gray-900">
                    {quizAttempts.length > 0
                      ? `${Math.round(Math.max(...quizAttempts.map((a) => (a.score / a.total_questions) * 100)))}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionLink to="/quiz-generator" icon={Sparkles} label="Generate Quiz" desc="Create MCQs from materials" />
                <QuickActionLink to="/recommended" icon={Brain} label="View Recommendations" desc="AI-powered course suggestions" />
                <QuickActionLink to="/chatbot" icon={FileQuestion} label="Ask AI Assistant" desc="Get learning guidance" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Recommendations */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Quizzes */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Quizzes</h2>
            {recentQuizzes.length === 0 ? (
              <div className="py-8 text-center">
                <FileQuestion className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-gray-500">No quizzes yet. Generate your first quiz!</p>
                <Link
                  to="/quiz-generator"
                  className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Generate Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => {
                  const attempt = quizAttempts.find((a) => a.quiz_id === quiz.id);
                  return (
                    <div key={quiz.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {attempt && (
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{attempt.score}/{attempt.total_questions}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Recommendations */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Top Recommendations</h2>
              <Link to="/recommended" className="text-sm font-semibold text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recommendedCourses.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  to="/recommended"
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition hover:bg-gray-100"
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    course.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <Brain className={`h-5 w-5 ${course.priority === 'high' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{course.title}</h4>
                    <p className="text-xs text-gray-500">{course.duration} • {course.level}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Progress Detail */}
        {enrollments.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Learning Progress Detail</h2>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{enrollment.course_title}</h4>
                    <p className="text-sm text-gray-500">
                      {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          enrollment.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right font-semibold text-blue-600">{enrollment.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-sm`}>
      <Icon className="h-8 w-8 opacity-90" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-white/80">{label}</p>
      </div>
    </div>
  );
}

function QuickActionLink({
  to,
  icon: Icon,
  label,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition hover:bg-gray-100"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </Link>
  );
}
