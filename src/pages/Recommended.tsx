import { Sparkles, CheckCircle, ArrowUp, AlertTriangle, Flame, Star, Route } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { recommendedCourses, learningPath } from '@/data/courses';
import { useEnrollment } from '@/hooks/useEnrollment';

export default function Recommended() {
  const { enrolledCourses, handleEnroll } = useEnrollment();

  const highPriority = recommendedCourses.filter((c) => c.priority === 'high');
  const mediumPriority = recommendedCourses.filter((c) => c.priority === 'medium');

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 flex items-center justify-center gap-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            <Sparkles className="h-8 w-8 text-blue-600" />
            AI-Powered Recommendations
          </h1>
          <p className="text-gray-600">Based on your competency analysis and learning goals</p>
        </div>

        {/* Competency Summary */}
        <div className="mb-12 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Your Competency Profile</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <CompetencyCard
              icon={CheckCircle}
              title="Strong Areas"
              items={['Statistical Analysis', 'Survey Methodology']}
              bgClass="bg-emerald-50"
              borderClass="border-emerald-500"
              iconClass="text-emerald-500"
            />
            <CompetencyCard
              icon={ArrowUp}
              title="Areas to Improve"
              items={['Machine Learning', 'Python Programming', 'Data Visualization']}
              bgClass="bg-amber-50"
              borderClass="border-amber-500"
              iconClass="text-amber-500"
            />
            <CompetencyCard
              icon={AlertTriangle}
              title="Priority Learning"
              items={['AI & ML Basics', 'Advanced Python']}
              bgClass="bg-red-50"
              borderClass="border-red-500"
              iconClass="text-red-500"
            />
          </div>
        </div>

        {/* High Priority */}
        <div className="mb-12">
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Flame className="h-6 w-6 text-red-500" /> High Priority Recommendations
          </h2>
          <p className="mb-6 text-gray-600">These courses address your most critical competency gaps</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highPriority.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrolled={enrolledCourses.includes(course.id)}
              />
            ))}
          </div>
        </div>

        {/* Medium Priority */}
        <div className="mb-12">
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Star className="h-6 w-6 text-blue-500" /> Recommended for Skill Enhancement
          </h2>
          <p className="mb-6 text-gray-600">Further strengthen your capabilities</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mediumPriority.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrolled={enrolledCourses.includes(course.id)}
              />
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Route className="h-6 w-6 text-blue-600" /> Suggested Learning Path
          </h2>
          <p className="mb-8 text-gray-600">Follow this path for optimal skill development</p>

          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:overflow-x-auto">
            {learningPath.map((step, idx) => (
              <div key={step.step} className="flex flex-col items-center md:flex-row">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    {step.step}
                  </div>
                  <div className="mt-3 max-w-[180px]">
                    <p className="text-xs text-gray-500">{step.label}</p>
                    <p className="font-semibold text-gray-900">{step.course}</p>
                    <p className="text-sm italic text-gray-500">{step.duration}</p>
                  </div>
                </div>
                {idx < learningPath.length - 1 && (
                  <div className="my-2 h-8 w-0.5 bg-blue-300 md:my-0 md:ml-4 md:mr-4 md:h-0.5 md:w-12" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700">
              Start Learning Path
            </button>
            <button className="rounded-xl border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50">
              Customize Path
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetencyCard({
  icon: Icon,
  title,
  items,
  bgClass,
  borderClass,
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  bgClass: string;
  borderClass: string;
  iconClass: string;
}) {
  return (
    <div className={`rounded-xl border-l-5 ${bgClass} p-6`} style={{ borderLeftWidth: '5px', borderLeftColor: 'currentColor' }}>
      <div className={iconClass}>
        <Icon className="mb-2 h-8 w-8" />
      </div>
      <h3 className="mb-3 text-lg font-bold text-gray-900">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-gray-700">
            <span className={`h-1.5 w-1.5 rounded-full ${iconClass.replace('text-', 'bg-')}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
