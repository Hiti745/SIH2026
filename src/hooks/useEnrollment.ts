import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Course } from '@/types';

export function useEnrollment() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [enrollments, setEnrollments] = useState<{ id: string; course_id: string; course_title: string; progress: number; status: string; enrolled_at: string }[]>([]);

  const fetchEnrollments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('enrollments')
      .select('id, course_id, course_title, progress, status, enrolled_at')
      .eq('user_id', user.id);
    if (data) {
      setEnrollments(data);
      setEnrolledCourses(data.map((e) => e.course_id));
    }
  }, [user]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleEnroll = async (course: Course) => {
    if (!user || enrolledCourses.includes(course.id)) return;
    const { data } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: course.id,
        course_title: course.title,
      })
      .select('id, course_id, course_title, progress, status, enrolled_at')
      .single();
    if (data) {
      setEnrollments((prev) => [...prev, data]);
      setEnrolledCourses((prev) => [...prev, course.id]);
    }
  };

  return { enrolledCourses, enrollments, handleEnroll, fetchEnrollments };
}
