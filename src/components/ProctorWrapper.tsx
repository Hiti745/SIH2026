import { type ReactNode, useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Camera, CameraOff, Maximize2, Loader2, X } from 'lucide-react';
import { useProctoring, type ProctorStatus } from '@/hooks/useProctoring';

interface ProctorWrapperProps {
  children: ReactNode;
  assessmentType: string;
  assessmentRef?: string;
  onStart: () => void;
  started: boolean;
  onComplete: () => void;
}

export default function ProctorWrapper({
  children,
  assessmentType,
  assessmentRef,
  onStart,
  started,
  onComplete,
}: ProctorWrapperProps) {
  const proctor = useProctoring({ assessmentType, assessmentRef, enabled: true });
  const [showIntro, setShowIntro] = useState(true);

  const handleStart = async () => {
    const ok = await proctor.start();
    if (ok) {
      setShowIntro(false);
      onStart();
    }
  };

  const handleComplete = () => {
    proctor.stop();
    onComplete();
  };

  useEffect(() => {
    return () => {
      proctor.stop();
    };
  }, [proctor]);

  if (showIntro || !started) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-lg rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Proctored Assessment</h2>
            <p className="mt-2 text-gray-600">
              This assessment is AI-proctored to ensure integrity. Please review the requirements below.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <ProctorReq
              icon={Camera}
              title="Camera Access Required"
              desc="Your webcam will monitor for face presence throughout the assessment."
            />
            <ProctorReq
              icon={Maximize2}
              title="Fullscreen Mode"
              desc="The assessment runs in fullscreen. Exiting will be logged as a violation."
            />
            <ProctorReq
              icon={ShieldCheck}
              title="No Tab Switching"
              desc="Switching browser tabs or windows will be detected and logged."
            />
          </div>

          {proctor.state === 'denied' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <CameraOff className="h-5 w-5 flex-shrink-0" />
              Camera access was denied. Please allow camera access and try again.
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={proctor.state === 'requesting'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {proctor.state === 'requesting' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Requesting camera...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" /> Start Proctored Assessment
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Proctor status bar */}
      <div className="sticky top-16 z-40 flex items-center justify-between bg-gray-900 px-4 py-2 text-sm text-white">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">Proctoring Active</span>
          </span>
          <span className="flex items-center gap-1.5">
            {proctor.faceDetected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Face detected
              </>
            ) : (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Face not detected
              </>
            )}
          </span>
          {proctor.fullscreenActive && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {proctor.violations.length > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertTriangle className="h-4 w-4" /> {proctor.violations.length} violation(s)
            </span>
          )}
          <button
            onClick={handleComplete}
            className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" /> End Assessment
          </button>
        </div>
      </div>

      {/* Webcam preview */}
      <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-lg border-2 border-gray-300 shadow-xl">
        <video
          ref={proctor.videoRef}
          className="h-24 w-32 object-cover"
          muted
          playsInline
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white">
          {proctor.faceDetected ? 'Monitoring' : 'No face detected'}
        </div>
      </div>

      {children}
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
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}
