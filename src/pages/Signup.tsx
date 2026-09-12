import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Building, IdCard, Loader2, AlertCircle,
  ChevronRight, ChevronLeft, Brain, Camera, CameraOff, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { departments } from '@/data/courses';
import { preAssessmentQuestions } from '@/data/preAssessment';

type Step = 'form' | 'proctor_consent' | 'assessment' | 'submitting';

export default function Signup() {
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Proctoring state
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [facePresent, setFacePresent] = useState(true);
  const [violations, setViolations] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionRef = useRef<number | null>(null);

  const navigate = useNavigate();

  const stopCamera = useCallback(() => {
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
      detectionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 160, height: 120 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);

      // Lightweight pixel-brightness face detection
      detectionRef.current = window.setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, 40, 30);
        const data = ctx.getImageData(0, 0, 40, 30).data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avg = total / (data.length / 4);
        const hasPresence = avg > 35 && avg < 230;
        setFacePresent(hasPresence);
        if (!hasPresence) setViolations((v) => v + 1);
      }, 3000);
    } catch {
      setCameraError(true);
      setCameraReady(false);
    }
  }, []);

  // Visibility change detection
  useEffect(() => {
    if (step !== 'assessment') return;
    const handleHide = () => {
      if (document.hidden) setViolations((v) => v + 1);
    };
    document.addEventListener('visibilitychange', handleHide);
    return () => document.removeEventListener('visibilitychange', handleHide);
  }, [step]);

  // Clean up camera on unmount or when not on assessment step
  useEffect(() => {
    if (step !== 'assessment' && step !== 'proctor_consent') {
      stopCamera();
    }
    return () => {
      if (step === 'assessment') stopCamera();
    };
  }, [step, stopCamera]);

  const validateForm = () => {
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters long'); return false; }
    if (!agree) { setError('Please agree to the Terms & Conditions'); return false; }
    return true;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (validateForm()) setStep('proctor_consent');
  };

  const handleStartProctored = async () => {
    await startCamera();
    setStep('assessment');
  };

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const allAnswered = Object.keys(answers).length === preAssessmentQuestions.length;

  const handleAssessmentSubmit = async () => {
    setError(null);
    stopCamera();
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

      // Compute per-skill scores from answers
      const skillScores: Record<string, { correct: number; total: number }> = {};
      preAssessmentQuestions.forEach((q, idx) => {
        if (!skillScores[q.skill]) skillScores[q.skill] = { correct: 0, total: 0 };
        skillScores[q.skill].total += 1;
        if (answers[idx] === q.correctIndex) skillScores[q.skill].correct += 1;
      });

      const assessmentRows = Object.entries(skillScores).map(([skill, { correct, total }]) => ({
        user_id: userId,
        skill_name: skill,
        score: Math.round((correct / total) * 100),
      }));
      if (assessmentRows.length > 0) {
        await supabase.from('competency_assessments').insert(assessmentRows);
      }

      // Log proctoring violations if any occurred
      if (violations > 0) {
        await supabase.from('proctoring_logs').insert({
          user_id: userId,
          assessment_type: 'pre_assessment',
          assessment_ref: 'signup',
          violation_type: 'face_not_detected_or_tab_switch',
          violation_count: violations,
        });
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
                Get personalized learning paths powered by AI to excel in India's Official Statistical System.
              </p>
            </>
          ) : step === 'proctor_consent' ? (
            <>
              <ShieldCheck className="mb-6 h-24 w-24 text-cyan-300" />
              <h3 className="mb-2 text-2xl font-bold">AI-Proctored Assessment</h3>
              <p className="text-center text-blue-100">
                The pre-assessment is proctored to ensure integrity. Your webcam will be used to monitor face presence throughout.
              </p>
            </>
          ) : (
            <>
              <Brain className="mb-6 h-24 w-24 text-cyan-300" />
              <h3 className="mb-2 text-2xl font-bold">Pre-Assessment Quiz</h3>
              <p className="mb-4 text-center text-blue-100">
                13 domain-specific questions across 5 competency areas of India's Official Statistical System.
              </p>
              {/* Live webcam thumbnail */}
              <div className="relative overflow-hidden rounded-xl border-2 border-cyan-300/40">
                <video ref={videoRef} className="h-28 w-40 object-cover" muted playsInline />
                <div className={`absolute inset-0 flex items-end justify-center pb-1 text-[10px] font-semibold ${facePresent ? 'text-emerald-300' : 'text-red-400'}`}>
                  {facePresent ? 'Face Detected' : 'Look at Camera'}
                </div>
              </div>
              {violations > 0 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-xs text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5" /> {violations} attention flag(s) recorded
                </div>
              )}
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="order-1 p-8 md:order-2">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Step 1: Account form */}
          {step === 'form' && (
            <>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="mb-6 text-gray-600">Join and start your learning journey</p>
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
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
              </p>
            </>
          )}

          {/* Step 2: Proctor consent */}
          {step === 'proctor_consent' && (
            <>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">Proctoring Consent</h2>
              <p className="mb-5 text-gray-600">Before taking the pre-assessment, please review and accept the proctoring requirements.</p>
              <div className="mb-5 space-y-3">
                <ProctorReq icon={Camera} title="Webcam Monitoring" desc="Your camera will be active throughout the assessment to verify face presence." />
                <ProctorReq icon={ShieldCheck} title="Tab Switch Detection" desc="Switching browser tabs during the assessment will be logged as a violation." />
                <ProctorReq icon={Brain} title="AI Analysis" desc="Violation data is used to flag potential integrity issues — not to disqualify automatically." />
              </div>
              {cameraError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  <CameraOff className="h-4 w-4 flex-shrink-0" /> Camera access denied. Please allow camera access to proceed.
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleStartProctored}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <ShieldCheck className="h-5 w-5" /> Accept & Start Assessment
                </button>
              </div>
            </>
          )}

          {/* Step 3: Assessment */}
          {(step === 'assessment' || step === 'submitting') && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pre-Assessment Quiz</h2>
                  <p className="text-sm text-gray-500">India's Official Statistical System</p>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  facePresent ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${facePresent ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                  {facePresent ? 'Monitored' : 'Look at Camera'}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
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

              <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
                {preAssessmentQuestions.map((q, qIdx) => {
                  const selected = answers[qIdx];
                  return (
                    <div key={qIdx} className="rounded-xl border-2 border-gray-100 p-4">
                      <div className="mb-2 flex items-start gap-2.5">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-700">
                          {qIdx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{q.question}</p>
                          <span className="mt-0.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                            {q.skill}
                          </span>
                        </div>
                      </div>
                      <div className="ml-8 grid gap-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selected === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswer(qIdx, optIdx)}
                              className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition ${
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

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { stopCamera(); setStep('proctor_consent'); }}
                  disabled={step === 'submitting'}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleAssessmentSubmit}
                  disabled={!allAnswered || step === 'submitting'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

function ProctorReq({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <Icon className="h-4.5 w-4.5 text-blue-600" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-600">{desc}</p>
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
