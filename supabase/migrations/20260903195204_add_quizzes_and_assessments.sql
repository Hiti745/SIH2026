/*
# Saamrthya AI — Quizzes, Questions & Assessments Schema

## Overview
Adds tables for AI-generated quizzes, multiple-choice questions, user quiz attempts,
and competency assessments. This enables the quiz generation feature and richer
dashboard analytics.

## New Tables

1. `quizzes` — generated quizzes linked to a user
   - `id`, `user_id`, `title`, `source_text` (the material the quiz was generated from),
   - `created_at`

2. `quiz_questions` — MCQs belonging to a quiz
   - `id`, `quiz_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`,
   - `correct_answer` (a/b/c/d), `explanation`

3. `quiz_attempts` — user attempts at a quiz with score
   - `id`, `user_id`, `quiz_id`, `score`, `total_questions`, `answers` (jsonb),
   - `created_at`

4. `competency_assessments` — skill self-assessments per user
   - `id`, `user_id`, `skill_name`, `score` (0-100), `created_at`

## Security
- RLS enabled on all tables.
- All tables are owner-scoped (auth.uid() = user_id).
- quiz_questions are scoped through the parent quiz's owner.
*/