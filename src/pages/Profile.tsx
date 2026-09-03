import { useState } from 'react';
import { UserCircle, BookOpen, CheckCircle, Award, Clock, TrendingUp, Trophy, Medal, Star, Lock, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import { skills } from '@/data/courses';

type Tab = 'overview' | 'competencies' | 'achievements';

export default function Profile() {
  const { profile, user } = useAuth();
  const { enrollments } = useEnrollment();
  const [tab, setTab] = useState<Tab>('overview');

  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const inProgress = enrollments.filter((e) => e.status === 'in_progress');
  const totalHours = enrollments.length * 20;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'competencies', label: 'Competency Analysis', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <UserCircle className="mx-auto mb-3 h-20 w-20 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{profile?.full_name ?? user?.email}</h3>
              <p className="font-medium text-gray-600">{profile?.designation ?? 'Statistical Officer'}</p>
              <p className="text-sm text-gray-500">{profile?.department ?? 'Department of Statistics'}</p>
            </div>

            <nav className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition ${
                    tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <t.icon className="h-5 w-5" /> {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            {tab === 'overview' && (
              <div>
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Dashboard Overview</h2>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={BookOpen} value={enrollments.length} label="Courses Enrolled" />
                  <StatCard icon={CheckCircle} value={completed} label="Courses Completed" />
                  <StatCard icon={Award} value={Math.max(0, completed)} label="Certificates Earned" />
                  <StatCard icon={Clock} value={`${totalHours}h`} label="Learning Hours" />
                </div>

                <h3 className="mb-4 text-lg font-bold text-gray-900">Current Learning Progress</h3>
                {inProgress.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
                    <p>No courses in progress yet. Browse courses and enroll to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inProgress.map((e) => (
                      <div key={e.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{e.course_title}</h4>
                          <p className="text-sm text-gray-500">In progress</p>
                        </div>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="font-semibold text-blue-600">{e.progress}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'competencies' && (
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Competency Gap Analysis</h2>
                <p className="mb-6 rounded-xl bg-gray-50 p-4 text-gray-600">
                  AI-powered analysis of your skills and recommendations for improvement
                </p>

                <h3 className="mb-4 text-lg font-bold text-gray-900">Skill Assessment</h3>
                <div className="mb-8 space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="mb-1 flex justify-between">
                        <span className="font-semibold text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-500">{skill.level}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${skill.color}`}
                          style={{ width: `${skill.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="mb-4 text-lg font-bold text-gray-900">Recommended Actions</h3>
                <div className="space-y-4">
                  <RecommendationCard
                    icon={TrendingUp}
                    title="Priority: Machine Learning"
                    desc='Your ML skills need improvement. We recommend: "Introduction to ML for Statisticians"'
                    borderClass="border-amber-500"
                  />
                  <RecommendationCard
                    icon={BookOpen}
                    title="Enhance: Data Visualization"
                    desc='Strengthen your visualization skills with "Advanced Data Viz with Python"'
                    borderClass="border-blue-500"
                  />
                </div>
              </div>
            )}

            {tab === 'achievements' && (
              <div>
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Achievements &amp; Certificates</h2>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AchievementCard icon={Trophy} title="Course Master" desc="Completed 5+ courses" date="Earned: Jan 2024" color="text-amber-400" />
                  <AchievementCard icon={Medal} title="Quick Learner" desc="Completed a course in 1 week" date="Earned: Dec 2023" color="text-gray-400" />
                  <AchievementCard icon={Star} title="Perfect Score" desc="Scored 100% in a quiz" date="Earned: Jan 2024" color="text-amber-400" />
                  <AchievementCard icon={Lock} title="Expert Level" desc="Complete 20 courses" progress="12/20 completed" color="text-gray-400" locked />
                </div>

                <h3 className="mb-4 text-lg font-bold text-gray-900">My Certificates</h3>
                <div className="space-y-3">
                  <CertificateItem title="Statistical Analysis Fundamentals" date="December 2023" />
                  <CertificateItem title="Data Collection Methods" date="November 2023" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
      <Icon className="h-8 w-8 opacity-90" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-blue-100">{label}</p>
      </div>
    </div>
  );
}

function RecommendationCard({
  icon: Icon,
  title,
  desc,
  borderClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  borderClass: string;
}) {
  return (
    <div className={`flex gap-3 rounded-xl border-l-4 ${borderClass} bg-gray-50 p-4`}>
      <Icon className={`h-8 w-8 flex-shrink-0 text-amber-500`} />
      <div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="mb-2 text-sm text-gray-600">{desc}</p>
        <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          View Course
        </button>
      </div>
    </div>
  );
}

function AchievementCard({
  icon: Icon,
  title,
  desc,
  date,
  progress,
  color,
  locked,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  date?: string;
  progress?: string;
  color: string;
  locked?: boolean;
}) {
  return (
    <div className={`rounded-xl border-2 border-gray-200 p-6 text-center transition hover:shadow-lg ${locked ? 'opacity-60' : ''}`}>
      <Icon className={`mx-auto mb-2 h-10 w-10 ${color}`} />
      <h4 className="font-bold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{desc}</p>
      {date && <p className="mt-1 text-xs italic text-gray-500">{date}</p>}
      {progress && <p className="mt-1 text-xs italic text-gray-500">{progress}</p>}
    </div>
  );
}

function CertificateItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
      <Award className="h-8 w-8 flex-shrink-0 text-blue-600" />
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">Issued: {date}</p>
      </div>
      <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
        <Download className="h-4 w-4" /> Download
      </button>
    </div>
  );
}
