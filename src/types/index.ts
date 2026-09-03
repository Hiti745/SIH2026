export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  durationHours: number;
  enrolled: number;
  rating: number;
  instructor: string;
  icon: string;
  recommended?: boolean;
  priority?: 'high' | 'medium';
  reason?: string;
  expectedOutcome?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  department: string;
  designation: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  course_title: string;
  progress: number;
  status: string;
  enrolled_at: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'bot';
  content: string;
  created_at?: string;
}

export interface Skill {
  name: string;
  level: string;
  percent: number;
  color: string;
}

export interface Quiz {
  id: string;
  title: string;
  source_text: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  created_at: string;
}

export interface CompetencyAssessment {
  id: string;
  skill_name: string;
  score: number;
  created_at: string;
}
