import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ScanResultsProps {
  scanId: string;
  onClose: () => void;
}

export default function ScanResults({ scanId, onClose }: ScanResultsProps) {
  const { data: scan, isLoading } = useQuery({
    queryKey: ["/api/scans", scanId],
  });

  if (isLoading) {
    return (
      <div className="mb-8 fade-in">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3 shimmer"></div>
              <div className="h-4 bg-muted rounded w-1/2 shimmer" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-32 bg-muted rounded shimmer" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground" data-testid="error-scan-not-found">
              Scan not found or failed to load.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis = scan.analysis || {};
  const getResultIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'normal':
      case 'good':
      case 'excellent':
        return <CheckCircle className="text-green-600 w-5 h-5" />;
      case 'attention':
      case 'medium':
      case 'moderate':
        return <AlertTriangle className="text-yellow-600 w-5 h-5" />;
      default:
        return <Info className="text-blue-600 w-5 h-5" />;
    }
  };

  const getResultColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'normal':
      case 'good':
      case 'excellent':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'attention':
      case 'medium':
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="mb-8 scale-in bounce-in">
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6 slide-in-left">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-card-foreground typewriter" data-testid="results-title">
                AI Analysis Results
              </h3>
              <Badge variant="secondary bounce-in stagger-1" data-testid="scan-type">{scan.type}</Badge>
            </div>
            <div className="flex items-center space-x-2 slide-in-right">
              <Badge className="bg-green-100 text-green-700 heartbeat" data-testid="scan-status">
                {scan.status === 'completed' ? 'Complete' : scan.status}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover-scale" data-testid="button-close-results">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Confidence Score */}
          <div className="mb-6 fade-in stagger-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground slide-in-left">Analysis Confidence</span>
              <span className="text-sm font-medium text-foreground bounce-in stagger-1" data-testid="confidence-score">
                {scan.confidence}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 hover-glow">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000 shimmer glow" 
                style={{ width: `${scan.confidence}%` }}
              ></div>
            </div>
          </div>
          
          {/* Analysis Summary */}
          {analysis.summary && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg scale-in stagger-3 hover-lift">
              <h4 className="font-medium text-card-foreground mb-2 typewriter">Summary</h4>
              <p className="text-sm text-muted-foreground fade-in stagger-1" data-testid="analysis-summary">
                {analysis.summary}
              </p>
            </div>
          )}
          
          {/* Detailed Results */}
          <div className="space-y-3">
            {/* Nutrition-specific results */}
            {scan.type === 'nutrition' && analysis.deficiencies && (
              <>
                <h4 className="font-medium text-card-foreground mb-3">Nutrient Assessment</h4>
                {analysis.deficiencies.map((deficiency: any, index: number) => (
                  <div key={index} className={`flex items-start p-3 rounded-lg border slide-in-left hover-lift ${getResultColor('attention')}`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <AlertTriangle className="text-yellow-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0 pulse-animation" />
                    <div className="flex-1">
                      <p className="text-sm font-medium fade-in" data-testid={`deficiency-${index}`}>
                        {typeof deficiency === 'string' ? deficiency : deficiency.name || 'Nutrient concern detected'}
                      </p>
                      {typeof deficiency === 'object' && deficiency.description && (
                        <p className="text-xs mt-1 opacity-80 slide-in-right stagger-1" data-testid={`deficiency-description-${index}`}>
                          {deficiency.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Acne-specific results */}
            {scan.type === 'acne' && (
              <>
                {analysis.acneType && (
                  <div className={`flex items-start p-3 rounded-lg border ${getResultColor(analysis.severity || 'medium')}`}>
                    {getResultIcon(analysis.severity)}
                    <div className="ml-3">
                      <p className="text-sm font-medium" data-testid="acne-type">
                        {analysis.acneType} - {analysis.severity || 'Moderate'} severity
                      </p>
                      {analysis.affectedAreas && (
                        <p className="text-xs mt-1 opacity-80" data-testid="affected-areas">
                          Affected areas: {Array.isArray(analysis.affectedAreas) ? analysis.affectedAreas.join(', ') : analysis.affectedAreas}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* General recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <>
                <h4 className="font-medium text-card-foreground mb-3 mt-6">Recommendations</h4>
                {analysis.recommendations.map((rec: any, index: number) => (
                  <div key={index} className={`flex items-start p-3 rounded-lg border slide-in-right hover-lift ${getResultColor('good')}`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <CheckCircle className="text-green-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0 heartbeat" />
                    <div className="flex-1">
                      <p className="text-sm font-medium bounce-in" data-testid={`recommendation-${index}`}>
                        {typeof rec === 'string' ? rec : rec.title || rec.description || 'Health recommendation'}
                      </p>
                      {typeof rec === 'object' && rec.description && rec.title && (
                        <p className="text-xs mt-1 opacity-80 fade-in stagger-1" data-testid={`recommendation-description-${index}`}>
                          {rec.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Fallback if no specific results */}
            {!analysis.deficiencies && !analysis.acneType && !analysis.recommendations && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="text-blue-600 w-5 h-5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800" data-testid="general-result">
                    Analysis completed successfully
                  </p>
                  <p className="text-xs text-blue-600">
                    Confidence: {scan.confidence}%
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-4 border-t border-border slide-in-left stagger-5">
            <Button variant="outline" className="flex-1 hover-scale" data-testid="button-save-results">
              Save Results
            </Button>
            <Button variant="outline" className="flex-1 hover-scale stagger-1" data-testid="button-share-results">
              Share Report
            </Button>
            <Button className="flex-1 hover-scale glow stagger-2" data-testid="button-new-scan">
              New Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
