import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UniformUploadSectionProps {
  goodUniform: string | null;
  badUniform: string | null;
  onGoodUniformChange: (img: string | null) => void;
  onBadUniformChange: (img: string | null) => void;
  errors?: { goodUniform?: string; badUniform?: string };
}

const UniformUploadSection = ({
  goodUniform,
  badUniform,
  onGoodUniformChange,
  onBadUniformChange,
  errors,
}: UniformUploadSectionProps) => {
  const goodRef = useRef<HTMLInputElement>(null);
  const badRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraTarget, setCameraTarget] = useState<"good" | "bad" | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

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

  const openCamera = useCallback(async (target: "good" | "bad") => {
    setCameraLoading(true);
    setCameraTarget(target);
    setStreamReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 720 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      // Wait a tick for video element to mount, then attach
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
  }, []);

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
    } else {
      onBadUniformChange(dataUrl);
      toast.success("Improper uniform photo captured!");
    }
    stopCamera();
  }, [cameraTarget, onGoodUniformChange, onBadUniformChange, stopCamera]);

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

  const renderCard = (
    type: "good" | "bad",
    image: string | null,
    setter: (img: string | null) => void,
    fileRef: React.RefObject<HTMLInputElement>,
    label: string,
    sublabel: string,
    badgeColor: string,
    error?: string
  ) => (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{sublabel}</p>
      {image ? (
        <div className="group relative">
          <img
            src={image}
            alt={label}
            className="aspect-[3/4] w-full rounded-lg border object-cover shadow-sm"
          />
          <div className={`absolute left-2 top-2 flex items-center gap-1 rounded-full ${badgeColor} px-2 py-0.5 text-[10px] font-medium text-white`}>
            <CheckCircle className="h-3 w-3" /> Uploaded
          </div>
          <button
            type="button"
            onClick={() => setter(null)}
            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors ${
            error ? "border-destructive" : "border-muted"
          }`}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center px-2">Capture or upload a full body photo</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => openCamera(type)}
            >
              <Camera className="h-3.5 w-3.5" /> Capture
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
          </div>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUpload(e, setter, label)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

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

      {/* Camera View */}
      {cameraTarget && (
        <div className="animate-fade-in space-y-3">
          <p className="text-center text-xs font-medium text-foreground">
            {cameraTarget === "good" ? "Capture Proper Uniform" : "Capture Improper Uniform"}
          </p>
          <div className="relative overflow-hidden rounded-xl border bg-black shadow-sm">
            {cameraLoading && (
              <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening camera…
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              Stand back to show full body
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={capturePhoto} className="flex-1 gap-2">
              <Camera className="h-4 w-4" /> Capture
            </Button>
            <Button type="button" variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!cameraTarget && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {renderCard(
            "good", goodUniform, onGoodUniformChange, goodRef,
            "Proper Uniform Photo",
            "Full body with shirt, tie, ID card & complete dress",
            "bg-green-500/90",
            errors?.goodUniform
          )}
          {renderCard(
            "bad", badUniform, onBadUniformChange, badRef,
            "Improper Uniform Photo",
            "Missing tie, ID card, or partial uniform",
            "bg-amber-500/90",
            errors?.badUniform
          )}
        </div>
      )}
    </div>
  );
};

export default UniformUploadSection;
