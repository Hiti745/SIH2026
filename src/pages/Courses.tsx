import { useState, useMemo } from 'react';
import { Search, Filter, ArrowRight, ArrowLeft } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { courses, categories } from '@/data/courses';
import type { Course } from '@/types';
import { useEnrollment } from '@/hooks/useEnrollment';

export default function Courses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const { enrolledCourses, handleEnroll } = useEnrollment();

  const filtered = useMemo(() => {
    let result = courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || c.category === category;
      const matchesLevel = !level || c.level === level;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') result = [...result].reverse();
    else if (sortBy === 'duration') result = [...result].sort((a, b) => a.durationHours - b.durationHours);
    else result = [...result].sort((a, b) => b.enrolled - a.enrolled);

    return result;
  }, [search, category, level, sortBy]);

  const perPage = 6;
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">All Courses</h1>
          <p className="text-gray-600">
            Browse our comprehensive collection of courses for statistical capacity building
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-600"
            />
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full rounded-lg border-2 border-gray-200 py-2.5 px-3 outline-none transition focus:border-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="w-full rounded-lg border-2 border-gray-200 py-2.5 px-3 outline-none transition focus:border-blue-600"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border-2 border-gray-200 py-2 px-3 outline-none transition focus:border-blue-600"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {pageItems.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg">No courses found matching your filters.</p>
          </div>
        ) : (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((course: Course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrolled={enrolledCourses.includes(course.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                  page === p
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 hover:border-blue-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
