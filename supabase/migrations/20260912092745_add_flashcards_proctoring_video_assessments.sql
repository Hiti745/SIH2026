/*
# Saamrthya AI — Flashcards, Proctoring & Video Assessments Schema

## Overview
Adds tables for domain-specific flashcards with spaced-repetition progress,
proctoring violation logs for assessments, and video assessment recordings
with behavioral analysis scores.

## New Tables

1. `flashcard_progress` — tracks per-user flashcard mastery
   - `id`, `user_id`, `flashcard_id` (text key matching frontend data),
   - `status` (new/learning/mastered), `review_count`, `last_reviewed_at`

2. `proctoring_logs` — records violations during proctored assessments
   - `id`, `user_id`, `assessment_type` (pre_assessment/quiz/video),
   - `assessment_ref` (uuid or text referencing the assessment),
   - `violation_type` (tab_switch/face_not_detected/multiple_faces/exited_fullscreen/webcam_error),
   - `violation_count`, `created_at`

3. `video_assessments` — stores video assessment results with behavioral analysis
   - `id`, `user_id`, `topic` (text), `duration_seconds` (int),
   - `behavioral_score` (0-100), `confidence_score` (0-100),
   - `clarity_score` (0-100), `feedback` (text),
   - `proctoring_passed` (boolean), `created_at`

## Security
- RLS enabled on all tables.
- All owner-scoped via auth.uid() = user_id.
- Proctoring logs are insert-only (users can log violations but not edit them).
*/

-- flashcard_progress table
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  review_count integer NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  UNIQUE(user_id, flashcard_id)
);

ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_flashcard_progress" ON flashcard_progress;
CREATE POLICY "select_own_flashcard_progress" ON flashcard_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_flashcard_progress" ON flashcard_progress;
CREATE POLICY "insert_own_flashcard_progress" ON flashcard_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_flashcard_progress" ON flashcard_progress;
CREATE POLICY "update_own_flashcard_progress" ON flashcard_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_flashcard_progress" ON flashcard_progress;
CREATE POLICY "delete_own_flashcard_progress" ON flashcard_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- proctoring_logs table
CREATE TABLE IF NOT EXISTS proctoring_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type text NOT NULL,
  assessment_ref text,
  violation_type text NOT NULL,
  violation_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proctoring_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_proctoring_logs" ON proctoring_logs;
CREATE POLICY "select_own_proctoring_logs" ON proctoring_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_proctoring_logs" ON proctoring_logs;
CREATE POLICY "insert_own_proctoring_logs" ON proctoring_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- video_assessments table
CREATE TABLE IF NOT EXISTS video_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  behavioral_score integer NOT NULL DEFAULT 0,
  confidence_score integer NOT NULL DEFAULT 0,
  clarity_score integer NOT NULL DEFAULT 0,
  feedback text,
  proctoring_passed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE video_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_video_assessments" ON video_assessments;
CREATE POLICY "select_own_video_assessments" ON video_assessments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_video_assessments" ON video_assessments;
CREATE POLICY "insert_own_video_assessments" ON video_assessments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_video_assessments" ON video_assessments;
CREATE POLICY "delete_own_video_assessments" ON video_assessments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);