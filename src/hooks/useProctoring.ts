import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type ProctorState = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export interface ProctorViolation {
  type: string;
  timestamp: number;
}

export interface ProctorStatus {
  state: ProctorState;
  violations: ProctorViolation[];
  faceDetected: boolean;
  cameraReady: boolean;
  fullscreenActive: boolean;
}

interface UseProctoringOptions {
  assessmentType: string;
  assessmentRef?: string;
  enabled?: boolean;
}

export function useProctoring({ assessmentType, assessmentRef, enabled = true }: UseProctoringOptions) {
  const { user } = useAuth();
  const [state, setState] = useState<ProctorState>('idle');
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const violationCountRef = useRef<Record<string, number>>({});
  const loggedViolationsRef = useRef<Set<string>>(new Set());

  const logViolation = useCallback(
    (type: string) => {
      if (!enabled) return;

      setViolations((prev) => [...prev, { type, timestamp: Date.now() }]);
      violationCountRef.current[type] = (violationCountRef.current[type] || 0) + 1;

      if (user && !loggedViolationsRef.current.has(type)) {
        loggedViolationsRef.current.add(type);
        supabase.from('proctoring_logs').insert({
          user_id: user.id,
          assessment_type: assessmentType,
          assessment_ref: assessmentRef ?? null,
          violation_type: type,
          violation_count: violationCountRef.current[type],
        });
      }
    },
    [enabled, user, assessmentType, assessmentRef]
  );

  const startCamera = useCallback(async () => {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setState('active');

      detectionIntervalRef.current = window.setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, 80, 60);
        const imageData = ctx.getImageData(0, 0, 80, 60);
        const data = imageData.data;

        let totalBrightness = 0;
        let pixelCount = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;
          pixelCount++;
        }
        const avgBrightness = totalBrightness / pixelCount;

        let centerBrightness = 0;
        let centerCount = 0;
        for (let y = 15; y < 45; y++) {
          for (let x = 25; x < 55; x++) {
            const idx = (y * 80 + x) * 4;
            centerBrightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            centerCount++;
          }
        }
        const avgCenter = centerBrightness / centerCount;

        const hasFace =
          avgBrightness > 40 &&
          avgBrightness < 220 &&
          avgCenter > avgBrightness * 0.7 &&
          avgCenter < avgBrightness * 1.3;

        setFaceDetected(hasFace);

        if (!hasFace && state === 'active') {
          logViolation('face_not_detected');
        }
      }, 3000);

      return true;
    } catch {
      setState('denied');
      return false;
    }
  }, [state, logViolation]);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenActive(true);
    } catch {
      logViolation('fullscreen_denied');
    }
  }, [logViolation]);

  const start = useCallback(async () => {
    loggedViolationsRef.current.clear();
    violationCountRef.current = {};
    setViolations([]);
    const cameraOk = await startCamera();
    if (cameraOk) {
      await enterFullscreen();
    }
    return cameraOk;
  }, [startCamera, enterFullscreen]);

  const stop = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setFullscreenActive(false);
    setCameraReady(false);
    setFaceDetected(false);
    setState('idle');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden && state === 'active') {
        logViolation('tab_switch');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && state === 'active' && fullscreenActive) {
        setFullscreenActive(false);
        logViolation('exited_fullscreen');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [enabled, state, fullscreenActive, logViolation]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    state,
    violations,
    faceDetected,
    cameraReady,
    fullscreenActive,
    videoRef,
    start,
    stop,
    logViolation,
  };
}
