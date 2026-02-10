import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import Webcam from "react-webcam";

interface CameraInterfaceProps {
  scanType: string;
  onScanComplete: (scanId: string) => void;
  onClose: () => void;
}

export default function CameraInterface({
  scanType,
  onScanComplete,
  onClose,
}: CameraInterfaceProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      // base64 → blob
      const res = await fetch(imageData);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("image", blob, "scan.jpg"); // ✅ exact name
      formData.append("scanType", scanType);      // ✅ required

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData, // ❗ DO NOT set headers
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Analysis failed");
      }

      return response.json();
    },

    onSuccess: (data) => {
      toast({
        title: "Scan Complete",
        description: "Image analyzed successfully.",
      });
      onScanComplete(data.scanId);
    },

    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setIsRecording(false);
    analyzeMutation.mutate(imageSrc);
  }, [analyzeMutation]);

  const retakeImage = () => {
    setCapturedImage(null);
    setIsRecording(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold capitalize">
              {scanType} Scan
            </h3>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X />
            </Button>
          </div>

          <div className="relative bg-muted rounded-lg aspect-video mb-4 overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                className="w-full h-full object-cover"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
            )}

            {analyzeMutation.isPending && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                Analyzing with AI…
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {!capturedImage ? (
              <>
                <Button onClick={captureImage}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
                <Button variant="destructive" onClick={onClose}>
                  <Square className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={retakeImage}>
                Retake
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
