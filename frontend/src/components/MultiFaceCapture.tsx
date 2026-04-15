import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check, Loader2, Upload, X, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import FaceAlignmentOverlay from "./FaceAlignmentOverlay";

const POSE_STEPS = [
  { label: "Front Face", instruction: "Look straight at the camera" },
  { label: "Left Side", instruction: "Turn your face to show your left side" },
  { label: "Right Side", instruction: "Turn your face to show your right side" },
  { label: "Face Upward", instruction: "Tilt your head Up" },
  { label: "Face Downward", instruction: "Tilt your head down" },
  { label: "Face Close-Up", instruction: "Come closer to camera" },
] as const;

interface MultiFaceCaptureProps {
  photos: (string | null)[];
  onPhotosChange: (photos: (string | null)[]) => void;
}

const MultiFaceCapture = ({ photos, onPhotosChange }: MultiFaceCaptureProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = photos.filter(Boolean).length;
  const allCaptured = completedCount === 6;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
    setIsLoading(false);
    setIsFaceAligned(false);
  }, []);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = useCallback(async (step: number, mode?: "user" | "environment") => {
    setCurrentStep(step);
    setIsLoading(true);
    setIsFaceAligned(false);
    const useMode = mode || facingMode;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: useMode, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      toast.error("Unable to access camera. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  const switchCamera = useCallback(() => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    if (isCameraOpen) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setIsCameraOpen(false);
      // Small delay then restart with new mode
      setTimeout(() => startCamera(currentStep, newMode), 100);
    }
  }, [facingMode, isCameraOpen, currentStep, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    const updated = [...photos];
    updated[currentStep] = dataUrl;
    onPhotosChange(updated);

    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch { /* silent */ }

    toast.success(`Step ${currentStep + 1} captured!`);

    const nextEmpty = updated.findIndex((p, i) => i > currentStep && !p);
    if (nextEmpty !== -1) {
      setCurrentStep(nextEmpty);
      setIsFaceAligned(false);
    } else if (updated.every(Boolean)) {
      stopCamera();
      setShowConfirmation(true);
    } else {
      const anyEmpty = updated.findIndex((p) => !p);
      if (anyEmpty !== -1) {
        setCurrentStep(anyEmpty);
        setIsFaceAligned(false);
      } else {
        stopCamera();
        setShowConfirmation(true);
      }
    }
  }, [photos, currentStep, onPhotosChange, stopCamera]);

  const retakeStep = (step: number) => {
    setShowConfirmation(false);
    startCamera(step);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...photos];
      updated[currentStep] = reader.result as string;
      onPhotosChange(updated);
      toast.success("Photo uploaded!");
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAll = () => {
    onPhotosChange(Array(6).fill(null));
    setShowConfirmation(false);
  };

  // Confirmation view
  if (showConfirmation && allCaptured) {
    return (
      <div className="space-y-4 animate-fade-in">
        <label className="text-sm font-medium text-foreground">Face Capture — All 6 Images ✓</label>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="group relative">
              <img src={p!} alt={POSE_STEPS[i].label} className="aspect-square w-full rounded-lg border object-cover shadow-sm" />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {POSE_STEPS[i].label}
              </span>
              <button
                type="button"
                onClick={() => retakeStep(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Retake ${POSE_STEPS[i].label}`}
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-4 w-4" /> All images captured
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={removeAll} className="ml-auto text-destructive">
            <X className="mr-1 h-3.5 w-3.5" /> Clear All
          </Button>
        </div>
      </div>
    );
  }

  const hasSomePhotos = completedCount > 0 && !isCameraOpen && !showConfirmation;

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        Face Capture (6 Images) <span className="text-destructive">*</span>
        {completedCount > 0 && <span className="text-muted-foreground"> — {completedCount}/6</span>}
      </label>

      {(isCameraOpen || hasSomePhotos) && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(completedCount / 6) * 100}%` }} />
          </div>
          {isCameraOpen && (
            <p className="text-center text-xs text-muted-foreground">
              Step {currentStep + 1} of 6 — <span className="font-medium text-foreground">{POSE_STEPS[currentStep].label}</span>
            </p>
          )}
        </div>
      )}

      {isCameraOpen && (
        <div className="animate-fade-in space-y-3">
          <div className="relative overflow-hidden rounded-xl border bg-black shadow-sm">
            <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            <FaceAlignmentOverlay videoRef={videoRef} onAlignmentChange={setIsFaceAligned} />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              {POSE_STEPS[currentStep].instruction}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCurrentStep(i); setIsFaceAligned(false); }}
                className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border text-[10px] transition-all ${i === currentStep ? "border-primary ring-2 ring-primary/30" : p ? "border-green-400" : "border-muted bg-muted/50"
                  }`}
              >
                {p ? <img src={p} alt="" className="h-full w-full rounded-md object-cover" /> : <span className="text-muted-foreground">{i + 1}</span>}
                {p && <Check className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-green-500 p-0.5 text-white" />}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={capturePhoto}
              className="flex-1 gap-2"
              disabled={!isFaceAligned}
            >
              <Camera className="h-4 w-4" />
              {isFaceAligned ? "Capture" : "Align face to capture"}
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={switchCamera} title="Switch Camera">
              <SwitchCamera className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading && !isCameraOpen && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Opening camera…
        </div>
      )}

      {hasSomePhotos && (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div
                key={i}
                className={`group relative flex aspect-square items-center justify-center rounded-lg border text-xs ${p ? "" : "bg-muted/40 text-muted-foreground"}`}
              >
                {p ? (
                  <>
                    <img src={p} alt={POSE_STEPS[i].label} className="h-full w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => retakeStep(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => startCamera(i)} className="flex flex-col items-center gap-1">
                    <Camera className="h-4 w-4" />
                    <span className="text-[10px]">{POSE_STEPS[i].label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => { const next = photos.findIndex((p) => !p); startCamera(next !== -1 ? next : 0); }}>
              <Camera className="h-3.5 w-3.5" /> Continue Capture
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={removeAll} className="text-destructive">
              <X className="mr-1 h-3.5 w-3.5" /> Clear All
            </Button>
          </div>
        </div>
      )}

      {!isCameraOpen && !isLoading && completedCount === 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => startCamera(0)}>
            <Camera className="h-4 w-4" /> Capture 6 Photos
          </Button>
          <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload Photo (Optional)
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      )}
    </div>
  );
};

export default MultiFaceCapture;
