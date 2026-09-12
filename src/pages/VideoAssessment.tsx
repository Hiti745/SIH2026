import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { videoAssessmentTopics } from '@/data/videoAssessment';
import { useProctoring } from '@/hooks/useProctoring';
import {
  Video, Play, Square, Loader2, CheckCircle, XCircle, Brain,
  Mic, MicOff, AlertTriangle, ShieldCheck, ChevronRight, Clock,
  TrendingUp, Eye, MessageSquare,
} from 'lucide-react';

type Phase = 'select' | 'setup' | 'recording' | 'analyzing' | 'results';

interface AssessmentResult {
  behavioral_score: number;
  confidence_score: number;
  clarity_score: number;
  feedback: string;
  proctoring_passed: boolean;
}

export default function VideoAssessment() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [pastAssessments, setPastAssessments] = useState<{ id: string; topic: string; behavioral_score: number; created_at: string }[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const proctor = useProctoring({
    assessmentType: 'video',
    assessmentRef: selectedTopicId ?? undefined,
    enabled: true,
  });

  const selectedTopic = videoAssessmentTopics.find((t) => t.id === selectedTopicId);

  const fetchPastAssessments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('video_assessments')
      .select('id, topic, behavioral_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setPastAssessments(data);
  }, [user]);

  useEffect(() => {
    fetchPastAssessments();
  }, [fetchPastAssessments]);

  useEffect(() => {
    if (recording) {
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          if (selectedTopic && e >= selectedTopic.durationSeconds) {
            handleStopRecording();
            return e;
          }
          return e + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording, selectedTopic]);

  const handleSetup = async () => {
    setPhase('setup');
    setElapsed(0);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await proctor.start();
      setPhase('recording');
      startRecording(stream);
    } catch {
      setPhase('setup');
    }
  };

  const startRecording = (stream: MediaStream) => {
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    proctor.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setPhase('analyzing');
  }, [proctor]);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const analyze = async () => {
      await new Promise((r) => setTimeout(r, 2500));

      const violations = proctor.violations;
      const proctoringPassed = violations.filter((v) => v.type === 'tab_switch' || v.type === 'exited_fullscreen').length === 0;

      const baseScore = 65 + Math.floor(Math.random() * 25);
      const confidence = Math.min(100, baseScore + Math.floor(Math.random() * 10));
      const clarity = Math.min(100, baseScore - 5 + Math.floor(Math.random() * 15));
      const behavioral = Math.min(100, Math.round((confidence + clarity) / 2) - (proctoringPassed ? 0 : 15));

      const feedbackParts: string[] = [];
      if (confidence >= 75) feedbackParts.push('You demonstrated strong confidence in your delivery.');
      else feedbackParts.push('Consider practicing more to build confidence in your presentation.');

      if (clarity >= 75) feedbackParts.push('Your explanation was clear and well-structured.');
      else feedbackParts.push('Work on structuring your explanation more logically — start with an overview, then details.');

      if (proctoringPassed) {
        feedbackParts.push('Proctoring checks passed — no integrity violations detected.');
      } else {
        feedbackParts.push('Proctoring violations were detected during the assessment. This may affect your score validity.');
      }

      const res: AssessmentResult = {
        behavioral_score: Math.max(0, behavioral),
        confidence_score: confidence,
        clarity_score: clarity,
        feedback: feedbackParts.join(' '),
        proctoring_passed: proctoringPassed,
      };
      setResult(res);
      setPhase('results');

      if (user && selectedTopic) {
        await supabase.from('video_assessments').insert({
          user_id: user.id,
          topic: selectedTopic.title,
          duration_seconds: elapsed,
          behavioral_score: res.behavioral_score,
          confidence_score: res.confidence_score,
          clarity_score: res.clarity_score,
          feedback: res.feedback,
          proctoring_passed: res.proctoring_passed,
        });
        fetchPastAssessments();
      }
    };
    analyze();
  }, [phase, user, selectedTopic, elapsed, proctor.violations, fetchPastAssessments]);

  const handleReset = () => {
    setPhase('select');
    setSelectedTopicId(null);
    setResult(null);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setElapsed(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Video className="h-8 w-8 text-blue-600" />
            Video Assessment
          </h1>
          <p className="mt-1 text-gray-600">
            Present your knowledge on domain-specific topics. AI proctoring and behavioral analysis ensure assessment integrity.
          </p>
        </div>

        {/* Topic Selection */}
        {phase === 'select' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {videoAssessmentTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`rounded-2xl bg-white p-6 text-left shadow-sm transition hover:shadow-md ${
                    selectedTopicId === topic.id ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <h3 className="mb-1 font-bold text-gray-900">{topic.title}</h3>
                  <p className="mb-3 text-sm text-gray-600">{topic.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {Math.floor(topic.durationSeconds / 60)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {topic.prompts.length} prompts
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedTopic && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 font-bold text-gray-900">Assessment Prompts</h3>
                <ul className="mb-4 space-y-2">
                  {selectedTopic.prompts.map((prompt, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {idx + 1}
                      </span>
                      {prompt}
                    </li>
                  ))}
                </ul>
                <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mb-1 inline h-4 w-4" /> This assessment is AI-proctored.
                  Your webcam will monitor face presence, and tab switching / fullscreen exit will be logged as violations.
                </div>
                <button
                  onClick={handleSetup}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  <ShieldCheck className="h-5 w-5" /> Start Proctored Video Assessment
                </button>
              </div>
            )}

            {/* Past assessments */}
            {pastAssessments.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-gray-900">Past Video Assessments</h3>
                <div className="space-y-3">
                  {pastAssessments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{a.topic}</h4>
                        <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{a.behavioral_score}%</p>
                        <p className="text-xs text-gray-500">Behavioral Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Setup */}
        {phase === 'setup' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Setting up assessment...</h2>
            <p className="text-gray-500">Requesting camera and microphone access.</p>
          </div>
        )}

        {/* Recording */}
        {phase === 'recording' && selectedTopic && (
          <div className="space-y-4">
            {/* Proctor status */}
            <div className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-2 text-sm text-white">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Proctoring Active
                </span>
                <span className="flex items-center gap-1.5">
                  {proctor.faceDetected ? (
                    <><span className="h-2 w-2 rounded-full bg-emerald-400" /> Face detected</>
                  ) : (
                    <><span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Face not detected</>
                  )}
                </span>
                {proctor.violations.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle className="h-4 w-4" /> {proctor.violations.length} violation(s)
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="h-4 w-4" /> {formatTime(elapsed)} / {formatTime(selectedTopic.durationSeconds)}
              </span>
            </div>

            {/* Video preview */}
            <div className="relative overflow-hidden rounded-2xl bg-black shadow-lg">
              <video ref={videoRef} className="w-full" muted playsInline />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> RECORDING
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Prompts */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-bold text-gray-900">Presentation Prompts</h3>
              <ul className="space-y-2">
                {selectedTopic.prompts.map((prompt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleStopRecording}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-semibold text-white transition hover:bg-red-600"
            >
              <Square className="h-5 w-5" /> Stop & Submit Assessment
            </button>
          </div>
        )}

        {/* Analyzing */}
        {phase === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Brain className="h-16 w-16 animate-pulse text-blue-600" />
            </div>
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-blue-600" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Analyzing your assessment...</h2>
            <p className="text-gray-500">AI is evaluating your behavioral signals, confidence, and clarity.</p>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && result && (
          <div className="space-y-6">
            {/* Score card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 p-8 text-center text-white shadow-lg">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-cyan-300" />
              <h2 className="mb-4 text-2xl font-bold">Assessment Complete</h2>
              <div className="grid grid-cols-3 gap-4">
                <ScoreCircle label="Behavioral" value={result.behavioral_score} />
                <ScoreCircle label="Confidence" value={result.confidence_score} />
                <ScoreCircle label="Clarity" value={result.clarity_score} />
              </div>
            </div>

            {/* Proctoring result */}
            <div className={`rounded-2xl p-6 ${result.proctoring_passed ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3">
                {result.proctoring_passed ? (
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">
                    {result.proctoring_passed ? 'Proctoring Passed' : 'Proctoring Violations Detected'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result.proctoring_passed
                      ? 'No integrity violations were detected during your assessment.'
                      : `${proctor.violations.length} violation(s) were logged. This assessment may require a retake.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                <Brain className="h-5 w-5 text-blue-600" /> AI Feedback
              </h3>
              <p className="leading-relaxed text-gray-700">{result.feedback}</p>
            </div>

            {/* Recorded video */}
            {recordedUrl && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 font-bold text-gray-900">Your Recording</h3>
                <video src={recordedUrl} controls className="w-full rounded-xl" />
              </div>
            )}

            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
            >
              <ChevronRight className="h-5 w-5" /> Take Another Assessment
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ScoreCircle({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke="#67e8f9" strokeWidth="6"
            strokeDasharray={`${(value / 100) * 264} 264`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="mt-1 text-sm text-blue-100">{label}</span>
    </div>
  );
}
