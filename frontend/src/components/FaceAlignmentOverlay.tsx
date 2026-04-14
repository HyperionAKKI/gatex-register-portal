import { useEffect, useRef, useCallback, useState } from "react";
import * as faceapi from "face-api.js";

interface FaceAlignmentOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onAlignmentChange: (aligned: boolean) => void;
}

const FaceAlignmentOverlay = ({ videoRef, onAlignmentChange }: FaceAlignmentOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAligned, setIsAligned] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face detection models:", err);
        // Allow capture even if models fail
        onAlignmentChange(true);
      }
    };
    loadModels();
  }, []);

  const detect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelsLoaded || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Define ideal center zone
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const ovalW = canvas.width * 0.35;
      const ovalH = canvas.height * 0.55;

      if (detection) {
        const { x, y, width, height } = detection.box;
        const faceCX = x + width / 2;
        const faceCY = y + height / 2;

        const dx = Math.abs(faceCX - cx) / canvas.width;
        const dy = Math.abs(faceCY - cy) / canvas.height;
        const sizeRatio = (width * height) / (canvas.width * canvas.height);

        const aligned = dx < 0.12 && dy < 0.12 && sizeRatio > 0.04 && sizeRatio < 0.45;

        setIsAligned(aligned);
        onAlignmentChange(aligned);

        // Draw face bounding box
        ctx.strokeStyle = aligned ? "#22c55e" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
      } else {
        setIsAligned(false);
        onAlignmentChange(false);
      }
    } catch {
      // Silent fail on detection errors
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [modelsLoaded, videoRef, onAlignmentChange]);

  useEffect(() => {
    if (modelsLoaded) {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [modelsLoaded, detect]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {/* Oval guide */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={`h-56 w-44 rounded-[50%] border-2 border-dashed transition-colors duration-300 ${
            isAligned ? "border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          }`}
        />
      </div>
      {/* Alignment status */}
      <div
        className={`absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors duration-300 ${
          isAligned
            ? "bg-green-500/80 text-white"
            : "bg-red-500/80 text-white"
        }`}
      >
        {!modelsLoaded ? "Loading detection…" : isAligned ? "✓ Perfect alignment" : "Align your face properly"}
      </div>
    </>
  );
};

export default FaceAlignmentOverlay;
