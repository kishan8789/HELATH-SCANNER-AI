import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Mic, Heart, Apple, UserCheck, Activity } from "lucide-react";
import CameraInterface from "@/components/camera-interface";
import VoiceAssistant from "@/components/voice-assistant";
import ScanResults from "@/components/scan-results";
import ScanHistory from "@/components/scan-history";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  // Get recent recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  const handleStartScan = (scanType: string) => {
    setActiveScan(scanType);
  };

  const handleScanComplete = (scanId: string) => {
    setCurrentScanId(scanId);
    setActiveScan(null);
  };

  const handleCloseScan = () => {
    setActiveScan(null);
    setCurrentScanId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 slide-in-left">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center heartbeat hover-glow">
                <Heart className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-foreground typewriter">HealthScan AI</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 slide-in-right">
              <a href="#" className="text-primary font-medium hover-scale stagger-1" data-testid="nav-dashboard">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors hover-scale stagger-2" data-testid="nav-history">History</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors hover-scale stagger-3" data-testid="nav-reports">Reports</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors hover-scale stagger-4" data-testid="nav-settings">Settings</a>
            </nav>
            
            <div className="flex items-center space-x-4 slide-in-right stagger-2">
              <Button variant="ghost" size="icon" className="hover-scale glow" data-testid="button-notifications">
                <Activity className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 rounded-full overflow-hidden breathe hover-glow border-2 border-primary/20">
                <img 
                  src="/attached_assets/generated_images/Professional_healthcare_doctor_portrait_27ca2068.png" 
                  alt="Dr. Sarah Johnson"
                  className="w-full h-full object-cover"
                  data-testid="user-avatar"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in stagger-3">
          <div className="relative bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-primary-foreground shimmer hover-lift overflow-hidden">
            {/* Background AI Technology Image */}
            <div className="absolute inset-0 opacity-20">
              <img 
                src="/attached_assets/generated_images/AI_healthcare_technology_background_31832b76.png" 
                alt="AI Healthcare Technology"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-2 bounce-in" data-testid="text-welcome">Good morning, Dr. Sarah Johnson</h2>
              <p className="text-primary-foreground/80 slide-in-left stagger-1">Ready to help your patients with AI-powered health analysis</p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2 scale-in stagger-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div>
                  <span className="text-sm" data-testid="status-vision">AI Vision Ready</span>
                </div>
                <div className="flex items-center space-x-2 scale-in stagger-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm" data-testid="status-voice">Voice Assistant Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Nutrition Scan Card */}
          <Card className="hover:shadow-md transition-shadow hover-lift scale-in stagger-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center float hover-glow">
                  <Apple className="text-green-600 w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 bounce-in stagger-2" data-testid="badge-ai-vision">AI Vision</Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Nutrition Analysis</h3>
              <p className="text-muted-foreground text-sm mb-4">Analyze nutrient deficiencies through body scan imaging using advanced AI vision technology</p>
              
              {/* Nutrition Image */}
              <div className="w-full h-32 bg-green-100 rounded-lg mb-4 overflow-hidden hover-scale">
                <img 
                  src="/attached_assets/generated_images/Healthy_nutrition_foods_display_3f0152af.png" 
                  alt="Healthy nutrition foods"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Button 
                className="w-full hover-scale glow" 
                onClick={() => handleStartScan("nutrition")}
                data-testid="button-start-nutrition-scan"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Body Scan
              </Button>
            </CardContent>
          </Card>
          
          {/* Skin Analysis Card */}
          <Card className="hover:shadow-md transition-shadow hover-lift scale-in stagger-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center float hover-glow" style={{ animationDelay: '1s' }}>
                  <UserCheck className="text-blue-600 w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 bounce-in stagger-3" data-testid="badge-gpt4-vision">GPT-4o Vision</Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Acne Analysis</h3>
              <p className="text-muted-foreground text-sm mb-4">Detect and assess facial acne problems with AI-powered dermatological analysis</p>
              
              {/* Skincare Image */}
              <div className="w-full h-32 bg-blue-100 rounded-lg mb-4 overflow-hidden hover-scale">
                <img 
                  src="/attached_assets/generated_images/Skincare_and_dermatology_concept_cded0f39.png" 
                  alt="Skincare and dermatology"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Button 
                className="w-full hover-scale glow" 
                onClick={() => handleStartScan("acne")}
                data-testid="button-start-acne-scan"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Face Scan
              </Button>
            </CardContent>
          </Card>
          
          {/* Voice Assistant Card */}
          <Card className="hover:shadow-md transition-shadow hover-lift scale-in stagger-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center breathe hover-glow">
                  <Mic className="text-purple-600 w-6 h-6 voice-wave" />
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 bounce-in stagger-4" data-testid="badge-tts-api">TTS API</Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Voice Assistant</h3>
              <p className="text-muted-foreground text-sm mb-4">Hands-free operation with AI voice commands and text-to-speech capabilities</p>
              
              {/* Voice waveform visualization */}
              <div className="flex items-center justify-center h-32 bg-muted rounded-lg mb-4 hover-glow">
                <div className="flex items-end space-x-1">
                  {[20, 35, 25, 40, 30, 20].map((height, i) => (
                    <div 
                      key={i}
                      className="w-2 bg-purple-500 rounded-full voice-wave" 
                      style={{ 
                        height: `${height}px`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <VoiceAssistant />
            </CardContent>
          </Card>
        </div>

        {/* Active Scan Interface */}
        {activeScan && (
          <CameraInterface
            scanType={activeScan}
            onScanComplete={handleScanComplete}
            onClose={handleCloseScan}
          />
        )}

        {/* Scan Results */}
        {currentScanId && (
          <ScanResults scanId={currentScanId} onClose={() => setCurrentScanId(null)} />
        )}

        {/* Recommendations Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-card-foreground">AI Health Recommendations</h3>
                <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="button-view-all-recommendations">
                  View All
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground" data-testid="text-no-recommendations">No recommendations yet. Complete a scan to get personalized health insights.</p>
                  </div>
                ) : (
                  recommendations.slice(0, 3).map((rec: any) => (
                    <div key={rec.id} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center mb-3">
                        <Apple className="text-green-600 w-5 h-5 mr-2" />
                        <h4 className="font-medium text-green-800" data-testid={`recommendation-title-${rec.id}`}>{rec.type}</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-3" data-testid={`recommendation-description-${rec.id}`}>{rec.description}</p>
                      <div className="flex items-center text-xs text-green-600">
                        <Activity className="w-3 h-3 mr-1" />
                        <span data-testid={`recommendation-updated-${rec.id}`}>Updated recently</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        <ScanHistory />
      </main>

      {/* Voice Assistant Floating Button */}
      <VoiceAssistant />
    </div>
  );
}
