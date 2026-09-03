import { Clock, Users, Star, User, BookOpen, Lightbulb, type LucideIcon } from 'lucide-react';
import type { Course } from '@/types';
import * as Icons from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (course: Course) => void;
  enrolled?: boolean;
}

export default function CourseCard({ course, onEnroll, enrolled }: CourseCardProps) {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[course.icon] ?? BookOpen;

  const levelColors: Record<string, string> = {
    Beginner: 'bg-emerald-500',
    Intermediate: 'bg-amber-500',
    Advanced: 'bg-red-500',
  };

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        course.recommended ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {course.priority === 'high' && (
        <div className="bg-red-500 py-1 text-center text-xs font-semibold text-white">
          Top Priority
        </div>
      )}
      {course.recommended && course.priority !== 'high' && (
        <div className="bg-blue-600 py-1 text-center text-xs font-semibold text-white">
          Recommended
        </div>
      )}

      <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 py-10">
        <IconComponent className="h-14 w-14 text-white opacity-90" />
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${levelColors[course.level]}`}
        >
          {course.level}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-bold text-gray-900">{course.title}</h3>
        <p className="mb-3 flex-1 text-sm leading-relaxed text-gray-600">{course.description}</p>

        {course.reason && (
          <div className="mb-3 flex items-start gap-2 rounded-md border-l-4 border-amber-400 bg-amber-50 p-2 text-xs text-gray-700">
            <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <span>Recommended because: {course.reason}</span>
          </div>
        )}

        {course.expectedOutcome && (
          <div className="mb-3 rounded-md border-l-4 border-emerald-500 bg-emerald-50 p-2 text-xs text-gray-700">
            <strong>Expected Outcome:</strong> {course.expectedOutcome}
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-blue-500" /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-blue-500" /> {course.enrolled.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-blue-500" /> {course.rating}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <User className="h-3.5 w-3.5 text-blue-500" /> {course.instructor}
          </span>
          {onEnroll && (
            <button
              onClick={() => onEnroll(course)}
              disabled={enrolled}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                enrolled
                  ? 'cursor-default bg-gray-100 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {enrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
