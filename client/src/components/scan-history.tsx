import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Apple, UserCheck, Activity, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function ScanHistory() {
  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["/api/scans"],
  });

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return <Apple className="text-green-600 w-5 h-5" />;
      case 'acne': return <UserCheck className="text-blue-600 w-5 h-5" />;
      default: return <Activity className="text-purple-600 w-5 h-5" />;
    }
  };

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'nutrition': return 'Nutrition Analysis';
      case 'acne': return 'Acne Analysis';
      default: return 'General Health';
    }
  };

  const getStatusColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusLabel = (confidence: number) => {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 70) return 'Good';
    return 'Needs Attention';
  };

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg mr-4"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate health metrics
  const nutritionScans = scans.filter((scan: any) => scan.type === 'nutrition');
  const acneScans = scans.filter((scan: any) => scan.type === 'acne');
  const overallHealth = scans.length > 0 ? 
    scans.reduce((acc: number, scan: any) => acc + scan.confidence, 0) / scans.length : 0;
  
  const nutritionHealth = nutritionScans.length > 0 ?
    nutritionScans.reduce((acc: number, scan: any) => acc + scan.confidence, 0) / nutritionScans.length : 0;
  
  const skinHealth = acneScans.length > 0 ?
    acneScans.reduce((acc: number, scan: any) => acc + scan.confidence, 0) / acneScans.length : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Recent Scans */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-card-foreground" data-testid="recent-scans-title">Recent Scans</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="button-view-history">
                View History
              </Button>
            </div>
            
            <div className="space-y-4">
              {scans.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" data-testid="no-scans-message">
                    No scans yet. Start your first health analysis above.
                  </p>
                </div>
              ) : (
                scans.slice(0, 5).map((scan: any) => (
                  <div 
                    key={scan.id} 
                    className="flex items-center p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                    data-testid={`scan-item-${scan.id}`}
                  >
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center mr-4">
                      {getScanIcon(scan.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground" data-testid={`scan-title-${scan.id}`}>
                        {getScanTypeLabel(scan.type)}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`scan-summary-${scan.id}`}>
                        {scan.analysis?.summary || 'Health analysis completed'}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span data-testid={`scan-date-${scan.id}`}>
                          {format(new Date(scan.createdAt), 'PPp')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span 
                        className={`text-sm font-medium ${getStatusColor(scan.confidence)}`}
                        data-testid={`scan-status-${scan.id}`}
                      >
                        {getStatusLabel(scan.confidence)}
                      </span>
                      <p className="text-xs text-muted-foreground" data-testid={`scan-confidence-${scan.id}`}>
                        {scan.confidence}% confidence
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Health Progress */}
      <div>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6" data-testid="health-progress-title">
              Health Progress
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-card-foreground">Overall Health</span>
                  <span className="text-sm text-muted-foreground" data-testid="overall-health-score">
                    {Math.round(overallHealth)}%
                  </span>
                </div>
                <Progress value={overallHealth} className="h-3" />
              </div>
              
              {nutritionHealth > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-card-foreground">Nutrition Status</span>
                    <span className="text-sm text-muted-foreground" data-testid="nutrition-health-score">
                      {Math.round(nutritionHealth)}%
                    </span>
                  </div>
                  <Progress value={nutritionHealth} className="h-3" />
                </div>
              )}
              
              {skinHealth > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-card-foreground">Skin Health</span>
                    <span className="text-sm text-muted-foreground" data-testid="skin-health-score">
                      {Math.round(skinHealth)}%
                    </span>
                  </div>
                  <Progress value={skinHealth} className="h-3" />
                </div>
              )}
            </div>
            
            {/* Weekly Progress Chart Placeholder */}
            {scans.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-card-foreground mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  This Week
                </h4>
                <div className="flex items-end justify-between h-16">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const hasData = index < scans.length;
                    const height = hasData ? Math.random() * 80 + 20 : 20;
                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div 
                          className={`w-4 rounded-t transition-all duration-500 ${
                            hasData ? 'bg-primary' : 'bg-muted'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1" data-testid={`chart-day-${day.toLowerCase()}`}>
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
