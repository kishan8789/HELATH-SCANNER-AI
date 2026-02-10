import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info, X, Zap } from "lucide-react"; // Zap icon for AI power
import { useQuery } from "@tanstack/react-query";

interface ScanResultsProps {
  scanId: string;
  onClose: () => void;
}

export default function ScanResults({ scanId, onClose }: ScanResultsProps) {
  // 1. Data fetching matching your backend route
  const { data: scan, isLoading } = useQuery({
    queryKey: ["/api/scans", scanId],
    queryFn: async () => {
      const res = await fetch(`/api/scans/${scanId}`);
      if (!res.ok) throw new Error("Scan not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="mb-8 fade-in">
        <Card className="hover-lift border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-10">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              <p className="text-sm font-medium animate-bounce">Generating AI Insights...</p>
              <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-shimmer" style={{ width: '60%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scan) return null; // Error handling handled by your parent or toast

  const analysis = scan.analysis || {};
  
  return (
    <div className="mb-8 scale-in">
      <Card className="hover-lift border-t-4 border-t-primary shadow-xl">
        <CardContent className="p-6">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-card-foreground">
                AI Health Report
              </h3>
              <Badge variant="outline" className="bg-primary/5 capitalize text-primary border-primary/20">
                {scan.type} Analysis
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* AI Pipeline Info (New Section for Recruiter) */}
          <div className="mb-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">Hybrid AI Pipeline Active</span>
            </div>
            <span className="text-[10px] text-blue-600 font-mono">HF-Vision + GPT-4o</span>
          </div>
          
          {/* Confidence Score (Hugging Face Data) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Detection Accuracy (HF)</span>
              <span className="text-lg font-bold text-primary">
                {scan.confidence}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-1000 relative overflow-hidden" 
                style={{ width: `${scan.confidence}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
          </div>
          
          {/* Analysis Summary (OpenAI Hinglish Data) */}
          {analysis.summary && (
            <div className="mb-8 p-5 bg-muted/30 rounded-xl border-l-4 border-primary italic shadow-inner">
              <h4 className="font-bold text-sm text-primary mb-2 uppercase tracking-tight">AI Summary</h4>
              <p className="text-md text-foreground/90 leading-relaxed">
                "{analysis.summary}"
              </p>
            </div>
          )}
          
          {/* Recommendations (Dynamic Cards) */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Recommended Actions</h4>
            <div className="grid grid-cols-1 gap-3">
              {analysis.recommendations?.map((rec: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-all hover:shadow-md group"
                >
                  <div className={`p-2 rounded-full mr-4 ${rec.priority === 'high' ? 'bg-red-50' : 'bg-green-50'}`}>
                    {rec.priority === 'high' ? 
                      <AlertTriangle className="h-4 w-4 text-red-500" /> : 
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">
                      {rec.title || rec}
                    </p>
                    {rec.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">
                        {rec.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom Actions */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t">
            <Button variant="outline" className="text-xs">Save</Button>
            <Button variant="outline" className="text-xs">Share</Button>
            <Button onClick={onClose} className="text-xs shadow-glow">Close Report</Button>
          </div>

          <p className="mt-6 text-[10px] text-center text-muted-foreground leading-tight italic">
            Note: This AI-generated assessment is for educational guidance only. 
            LPU Placement Project 2026.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}