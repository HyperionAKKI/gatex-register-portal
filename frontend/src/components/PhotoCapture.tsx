import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface PhotoCaptureProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
}

const PhotoCapture = ({ photo, onPhotoChange }: PhotoCaptureProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch {
      toast.error("Unable to access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onPhotoChange(dataUrl);
    stopCamera();
    toast.success("Photo captured successfully!");
  }, [onPhotoChange, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onPhotoChange(reader.result as string);
      toast.success("Photo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    onPhotoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        Student Photo
      </label>

      {/* Preview */}
      {photo && !isCameraOpen && (
        <div className="relative mx-auto w-fit animate-fade-in">
          <img
            src={photo}
            alt="Student preview"
            className="h-40 w-40 rounded-xl border object-cover shadow-sm"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-transform hover:scale-110"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Camera view */}
      {isCameraOpen && (
        <div className="animate-fade-in space-y-3">
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
            />
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

      {/* Action buttons */}
      {!isCameraOpen && !photo && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={startCamera}
          >
            <Camera className="h-4 w-4" /> Capture Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Upload Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Retake */}
      {photo && !isCameraOpen && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={startCamera}>
            <RotateCcw className="h-3.5 w-3.5" /> Retake
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" /> Upload Different
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
