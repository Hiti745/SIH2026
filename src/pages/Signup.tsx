import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Building, IdCard, Loader2, AlertCircle,
  CheckCircle, XCircle, ChevronRight, ChevronLeft, Brain,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { departments } from '@/data/courses';
import { preAssessmentQuestions } from '@/data/preAssessment';

type Step = 'form' | 'assessment' | 'submitting';

export default function Signup() {
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!agree) {
      setError('Please agree to the Terms & Conditions');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (validateForm()) {
      setStep('assessment');
    }
  };

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const allAnswered = Object.keys(answers).length === preAssessmentQuestions.length;

  const handleAssessmentSubmit = async () => {
    setError(null);
    setStep('submitting');

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setStep('assessment');
      return;
    }

    if (data.user) {
      const userId = data.user.id;
      const deptLabel = departments.find((d) => d.value === department)?.label ?? department;
      await supabase.from('profiles').insert({
        id: userId,
        full_name: fullName,
        department: deptLabel,
        designation,
      });

      const skillScores: Record<string, { correct: number; total: number }> = {};
      preAssessmentQuestions.forEach((q, idx) => {
        if (!skillScores[q.skill]) {
          skillScores[q.skill] = { correct: 0, total: 0 };
        }
        skillScores[q.skill].total += 1;
        if (answers[idx] === q.correctIndex) {
          skillScores[q.skill].correct += 1;
        }
      });

      const assessmentRows = Object.entries(skillScores).map(([skill, { correct, total }]) => ({
        user_id: userId,
        skill_name: skill,
        score: Math.round((correct / total) * 100),
      }));

      if (assessmentRows.length > 0) {
        await supabase.from('competency_assessments').insert(assessmentRows);
      }
    }

    navigate('/login');
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        {/* Left panel */}
        <div className="order-2 flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 p-10 text-white md:order-1">
          {step === 'form' ? (
            <>
              <BarChartIcon />
              <h3 className="mb-2 text-2xl font-bold">Build Your Competencies</h3>
              <p className="text-center text-blue-100">
                Get personalized learning paths powered by AI to excel in statistical analysis.
              </p>
            </>
          ) : (
            <>
              <Brain className="mb-6 h-24 w-24 text-cyan-300" />
              <h3 className="mb-2 text-2xl font-bold">Pre-Assessment Quiz</h3>
              <p className="text-center text-blue-100">
                Answer a few questions so our AI can identify your competency gaps and recommend
                personalized training paths.
              </p>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="order-1 p-10 md:order-2">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {step === 'form' && (
            <>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="mb-6 text-gray-600">Join us and start your learning journey</p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <FormField icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="Enter your full name" />
                <FormField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="Enter your email" />

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-600"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <FormField icon={IdCard} label="Designation" value={designation} onChange={setDesignation} placeholder="Your designation" />
                <FormField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a password" />
                <FormField icon={Lock} label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm your password" />

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                  <span>I agree to the Terms &amp; Conditions</span>
                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue to Assessment <ChevronRight className="h-5 w-5" />
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </>
          )}

          {(step === 'assessment' || step === 'submitting') && (
            <>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">Pre-Assessment Quiz</h2>
              <p className="mb-2 text-gray-600">
                Answer all {preAssessmentQuestions.length} questions to complete your registration.
              </p>

              {/* Progress */}
              <div className="mb-6">
                <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                  <span>{Object.keys(answers).length} of {preAssessmentQuestions.length} answered</span>
                  <span>{Math.round((Object.keys(answers).length / preAssessmentQuestions.length) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / preAssessmentQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
                {preAssessmentQuestions.map((q, qIdx) => {
                  const selected = answers[qIdx];
                  return (
                    <div key={qIdx} className="rounded-xl border-2 border-gray-100 p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                          {qIdx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{q.question}</p>
                          <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            {q.skill}
                          </span>
                        </div>
                      </div>
                      <div className="ml-10 grid gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selected === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswer(qIdx, optIdx)}
                              className={`flex items-start gap-2.5 rounded-lg border-2 p-3 text-left text-sm transition ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-gray-700">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={step === 'submitting'}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleAssessmentSubmit}
                  disabled={!allAnswered || step === 'submitting'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 'submitting' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {step === 'submitting' ? 'Creating account...' : 'Complete Sign Up'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function FormField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-600"
        />
      </div>
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg className="mb-6 h-24 w-24 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 13.125 4.5 13.125 6 11.625C7.5 10.125 7.5 6.375 9 6.375C10.5 6.375 10.5 16.875 12 16.875C13.5 16.875 13.5 9.375 15 9.375C16.5 9.375 16.5 13.125 18 13.125C19.5 13.125 19.5 10.875 21 10.875" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5M5 5L3 7M5 5L7 7" />
    </svg>
  );
}
