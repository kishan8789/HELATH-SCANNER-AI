import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Webcam from "react-webcam";

interface CameraInterfaceProps {
  scanType: string;
  onScanComplete: (scanId: string) => void;
  onClose: () => void;
}

export default function CameraInterface({ scanType, onScanComplete, onClose }: CameraInterfaceProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');
      formData.append('scanType', scanType);
      
      const result = await apiRequest('POST', '/api/analyze-image', formData);
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scan Complete",
        description: "Your image has been analyzed successfully.",
      });
      onScanComplete(data.scanId);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed", 
        description: error.message || "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsRecording(false);
      // Start analysis immediately
      analyzeMutation.mutate(imageSrc);
    }
  }, [analyzeMutation]);

  const retakeImage = () => {
    setCapturedImage(null);
    setIsRecording(true);
  };

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'nutrition': return 'Nutrition Analysis';
      case 'acne': return 'Acne Analysis';
      case 'general': return 'General Health';
      default: return 'Health Scan';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="camera-interface-modal">
      <Card className="w-full max-w-4xl mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-card-foreground" data-testid="scan-title">
                {getScanTypeLabel(scanType)}
              </h3>
              <Badge variant="secondary" data-testid="scan-type-badge">{scanType}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isRecording && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground" data-testid="status-recording">Recording</span>
                </>
              )}
              {analyzeMutation.isPending && (
                <Badge variant="secondary" data-testid="status-analyzing">Analyzing...</Badge>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-camera">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Camera Feed */}
          <div className="relative bg-muted rounded-lg aspect-video flex items-center justify-center mb-4 overflow-hidden">
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured scan" 
                className="w-full h-full object-cover"
                data-testid="captured-image"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                data-testid="webcam-feed"
                onUserMediaError={(error) => {
                  console.error("Camera access error:", error);
                  toast({
                    title: "Camera Access Failed",
                    description: "Please allow camera access to use this feature.",
                    variant: "destructive",
                  });
                }}
              />
            )}
            
            {!capturedImage && !isRecording && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-primary mb-2 mx-auto" />
                  <p className="text-primary font-medium" data-testid="text-camera-inactive">Camera Inactive</p>
                </div>
              </div>
            )}
            
            {analyzeMutation.isPending && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="font-medium" data-testid="text-analyzing">Analyzing with AI Vision...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex justify-center space-x-3">
            {!capturedImage ? (
              <>
                <Button 
                  onClick={captureImage}
                  disabled={!isRecording || analyzeMutation.isPending}
                  data-testid="button-capture"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={onClose}
                  data-testid="button-cancel"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={retakeImage}
                disabled={analyzeMutation.isPending}
                data-testid="button-retake"
              >
                <Camera className="mr-2 h-4 w-4" />
                Retake
              </Button>
            )}
          </div>
          
          {/* Analysis Progress */}
          {analyzeMutation.isPending && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground" data-testid="progress-label">Processing Image...</span>
                <span className="text-sm font-medium text-primary" data-testid="progress-percentage">Processing</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
