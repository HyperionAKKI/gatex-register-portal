import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, Camera, Loader2, SwitchCamera, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export interface BadUniformPhotos {
  missingTie: string | null;
  missingBelt: string | null;
  missingIdCard: string | null;
  other: string | null;
}

const BAD_UNIFORM_STEPS = [
  { key: "missingTie" as const, label: "Missing Tie", instruction: "Take a full-body photo showing the student WITHOUT a tie" },
  { key: "missingBelt" as const, label: "Missing Belt", instruction: "Take a full-body photo showing the student WITHOUT a belt" },
  { key: "missingIdCard" as const, label: "Missing ID Card", instruction: "Take a full-body photo showing the student WITHOUT an ID card" },
  { key: "other" as const, label: "Other", instruction: "Take a full-body photo showing any other uniform violation" },
];

interface UniformUploadSectionProps {
  goodUniform: string | null;
  sportsUniform: string | null;
  badUniformPhotos: BadUniformPhotos;
  onGoodUniformChange: (img: string | null) => void;
  onSportsUniformChange: (img: string | null) => void;
  onBadUniformPhotosChange: (photos: BadUniformPhotos) => void;
  errors?: { goodUniform?: string; badUniform?: string };
}

const UniformUploadSection = ({
  goodUniform,
  sportsUniform,
  badUniformPhotos,
  onGoodUniformChange,
  onSportsUniformChange,
  onBadUniformPhotosChange,
  errors,
}: UniformUploadSectionProps) => {
  const goodRef = useRef<HTMLInputElement>(null);
  const sportsRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera state
  const [cameraTarget, setCameraTarget] = useState<"good" | "sports" | "missingTie" | "missingBelt" | "missingIdCard" | "other" | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  // Bad uniform dropdown
  const [selectedBadStep, setSelectedBadStep] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraTarget(null);
    setCameraLoading(false);
    setStreamReady(false);
  }, []);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  // Attach stream to video element whenever streamReady or cameraTarget changes
  useEffect(() => {
    if (streamReady && cameraTarget && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [streamReady, cameraTarget]);

  const openCamera = useCallback(async (target: "good" | "sports" | "missingTie" | "missingBelt" | "missingIdCard" | "other", mode?: "user" | "environment") => {
    setCameraLoading(true);
    setCameraTarget(target);
    setStreamReady(false);
    const useMode = mode || facingMode;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: useMode, width: { ideal: 720 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setStreamReady(true);
        setCameraLoading(false);
      });
    } catch {
      toast.error("Unable to access camera. Please check permissions.");
      setCameraTarget(null);
      setCameraLoading(false);
    }
  }, [facingMode]);

  const switchCamera = useCallback(() => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    if (cameraTarget) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStreamReady(false);
      setCameraLoading(true);
      setTimeout(() => openCamera(cameraTarget, newMode), 100);
    }
  }, [facingMode, cameraTarget, openCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !cameraTarget) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    if (cameraTarget === "good") {
      onGoodUniformChange(dataUrl);
      toast.success("Proper uniform photo captured!");
    } else if (cameraTarget === "sports") {
      onSportsUniformChange(dataUrl);
      toast.success("Sports uniform photo captured!");
    } else {
      // It's one of the bad uniform steps
      const updatedPhotos = { ...badUniformPhotos, [cameraTarget]: dataUrl };
      onBadUniformPhotosChange(updatedPhotos);
      const stepLabel = BAD_UNIFORM_STEPS.find(s => s.key === cameraTarget)?.label || "";
      toast.success(`${stepLabel} photo captured!`);
    }
    stopCamera();
  }, [cameraTarget, onGoodUniformChange, onBadUniformPhotosChange, badUniformPhotos, stopCamera]);

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (img: string | null) => void,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
      toast.success(`${label} uploaded!`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getCameraInstruction = () => {
    if (cameraTarget === "good") return "Stand back to show full body in regular uniform";
    if (cameraTarget === "sports") return "Stand back to show full body in sports uniform";
    const step = BAD_UNIFORM_STEPS.find(s => s.key === cameraTarget);
    return step?.instruction || "Stand back to show full body";
  };

  const badPhotosCompleted = [badUniformPhotos.missingTie, badUniformPhotos.missingBelt, badUniformPhotos.missingIdCard, badUniformPhotos.other].filter(Boolean).length;
  const allBadDone = badPhotosCompleted === 4;

  const handleBadStepSelect = (stepKey: string) => {
    setSelectedBadStep(stepKey);
    setDropdownOpen(false);
    openCamera(stepKey as "missingTie" | "missingBelt" | "missingIdCard" | "other");
  };

  const getNextUnfinishedBadStep = () => {
    return BAD_UNIFORM_STEPS.find(s => !badUniformPhotos[s.key]);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          Uniform Verification <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Capture or upload full-body photos for uniform verification
        </p>
      </div>

      {/* Camera View (shared for good & bad uniform) */}
      {cameraTarget && (
        <div className="animate-fade-in space-y-3">
          <p className="text-center text-xs font-medium text-foreground">
            {cameraTarget === "good"
              ? "Capture Proper Uniform"
              : cameraTarget === "sports"
              ? "Capture Sports Uniform"
              : `Capture: ${BAD_UNIFORM_STEPS.find(s => s.key === cameraTarget)?.label}`}
          </p>
          <div className="relative overflow-hidden rounded-xl border bg-black shadow-sm">
            {cameraLoading && (
              <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening camera…
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm text-center max-w-[90%]">
              {getCameraInstruction()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={capturePhoto} className="flex-1 gap-2">
              <Camera className="h-4 w-4" /> Capture
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

      {!cameraTarget && (
        <div className="space-y-6">
          {/* ── Proper Uniform Section ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Regular Uniform Photo</label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Full-body photo in complete regular school uniform
              </p>
              {goodUniform ? (
                <div className="group relative">
                  <img
                    src={goodUniform}
                    alt="Proper Uniform"
                    className="aspect-[3/4] w-full rounded-lg border object-cover shadow-sm"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
                    <CheckCircle className="h-3 w-3" /> Uploaded
                  </div>
                  <button
                    type="button"
                    onClick={() => onGoodUniformChange(null)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors ${
                    errors?.goodUniform ? "border-destructive" : "border-muted"
                  }`}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center px-2">Capture or upload regular uniform</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => openCamera("good")}
                    >
                      <Camera className="h-3.5 w-3.5" /> Capture
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => goodRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={goodRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e, onGoodUniformChange, "Regular Uniform")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Sports Uniform Photo</label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Full-body photo in complete sports uniform
              </p>
              {sportsUniform ? (
                <div className="group relative">
                  <img
                    src={sportsUniform}
                    alt="Sports Uniform"
                    className="aspect-[3/4] w-full rounded-lg border object-cover shadow-sm"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
                    <CheckCircle className="h-3 w-3" /> Uploaded
                  </div>
                  <button
                    type="button"
                    onClick={() => onSportsUniformChange(null)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors ${
                    errors?.goodUniform ? "border-destructive" : "border-muted"
                  }`}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center px-2">Capture or upload sports uniform</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => openCamera("sports")}
                    >
                      <Camera className="h-3.5 w-3.5" /> Capture
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => sportsRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={sportsRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e, onSportsUniformChange, "Sports Uniform")}
              />
            </div>
          </div>
          {errors?.goodUniform && <p className="text-xs text-destructive">{errors.goodUniform}</p>}

          {/* ── Bad Uniform Section (Multi-Step) ── */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground">Improper Uniform Photos</label>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Capture photos for each missing uniform item. Select an item below, then take the photo. Minimum 2 photos are required.
            </p>

            {badPhotosCompleted >= 2 && badPhotosCompleted < 4 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-2">
                <CheckCircle className="h-3.5 w-3.5" /> Minimum 2 photos captured. You can submit or capture more.
              </div>
            )}

            {/* Step indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BAD_UNIFORM_STEPS.map((step) => {
                const photo = badUniformPhotos[step.key];
                return (
                  <div key={step.key} className="space-y-1.5">
                    <div
                      className={`group relative flex aspect-[3/4] w-full flex-col items-center justify-center rounded-lg border transition-colors ${
                        photo ? "border-amber-400" : "border-2 border-dashed border-muted bg-muted/30"
                      }`}
                    >
                      {photo ? (
                        <>
                          <img src={photo} alt={step.label} className="h-full w-full rounded-lg object-cover" />
                          <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
                            <CheckCircle className="h-2.5 w-2.5" /> Done
                          </div>
                          <button
                            type="button"
                            onClick={() => onBadUniformPhotosChange({ ...badUniformPhotos, [step.key]: null })}
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBadStepSelect(step.key)}
                          className="flex flex-col items-center gap-1.5 p-2"
                        >
                          <Camera className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">{step.label}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground truncate">{step.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Dropdown to select & capture */}
            {!allBadDone && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="text-muted-foreground">
                    {selectedBadStep
                      ? `Selected: ${BAD_UNIFORM_STEPS.find(s => s.key === selectedBadStep)?.label}`
                      : "Select missing item to capture…"}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg animate-fade-in">
                    {BAD_UNIFORM_STEPS.filter(s => !badUniformPhotos[s.key]).map((step) => (
                      <button
                        key={step.key}
                        type="button"
                        onClick={() => handleBadStepSelect(step.key)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                        {step.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {allBadDone && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <CheckCircle className="h-3.5 w-3.5" /> All improper uniform photos captured
              </div>
            )}

            {errors?.badUniform && <p className="text-xs text-destructive">{errors.badUniform}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniformUploadSection;
