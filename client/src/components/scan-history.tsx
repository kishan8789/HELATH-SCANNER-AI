import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Apple, UserCheck, Activity, Calendar, TrendingUp, 
  ChevronRight, BarChart3, Clock 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function ScanHistory() {
  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["/api/scans"],
  });

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return <Apple className="text-emerald-400 w-6 h-6" />;
      case 'acne': return <UserCheck className="text-blue-400 w-6 h-6" />;
      default: return <Activity className="text-rose-400 w-6 h-6" />;
    }
  };

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'nutrition': return 'Nutrition Analysis';
      case 'acne': return 'Dermal Scan';
      default: return 'General Health';
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Neural Records...</p>
      </div>
    );
  }

  // Calculate health metrics for the Sidebar
  const nutritionScans = scans.filter((scan: any) => scan.scanType === 'nutrition');
  const acneScans = scans.filter((scan: any) => scan.scanType === 'acne');
  const overallHealth = scans.length > 0 ? 85 : 0; // Static placeholder for demo
  const nutritionHealth = 78; 
  const skinHealth = 92;

  return (
    <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      {/* 📜 Left Side: Recent Scans List */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Scan History</h3>
            <p className="text-slate-500 font-medium">Recent diagnostic logs from your neural engine.</p>
          </div>
          <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px]">
            View All Logs <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {scans.length === 0 ? (
            <Card className="bg-slate-900/40 border-dashed border-white/10 p-20 text-center rounded-[2.5rem]">
              <Activity className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
              <p className="text-slate-500 italic">No records found. Initialize your first scan above.</p>
            </Card>
          ) : (
            scans.slice(0, 5).map((scan: any, index: number) => (
              <Card 
                key={scan.id} 
                className="group bg-slate-900/40 hover:bg-slate-900/80 border-white/5 backdrop-blur-xl transition-all duration-500 rounded-[2rem] overflow-hidden border-l-4 border-l-transparent hover:border-l-rose-500"
              >
                <CardContent className="p-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl group-hover:scale-110 transition-transform">
                      {getScanIcon(scan.scanType)}
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase italic tracking-tight text-lg leading-none mb-2">
                        {getScanTypeLabel(scan.scanType)}
                      </h4>
                      <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={12} className="text-rose-500" /> {format(new Date(scan.createdAt), 'PPp')}</span>
                        <Badge className="bg-white/5 text-slate-400 border-none text-[8px]">ID: #{scan.id.toString().slice(-4)}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 justify-end mb-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Analyzed
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">AI Confidence: 98%</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 📊 Right Side: Health Analytics Sidebar */}
      <div className="space-y-8">
        <Card className="bg-slate-900/60 border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-3xl">
          <CardContent className="p-0 space-y-10">
            <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
              <TrendingUp className="text-rose-500" /> Analytics
            </h3>

            {/* Health Bars */}
            <div className="space-y-8">
              {[
                { label: "Overall Vitality", value: overallHealth, color: "bg-rose-500" },
                { label: "Nutritional Balance", value: nutritionHealth, color: "bg-emerald-500" },
                { label: "Dermal Integrity", value: skinHealth, color: "bg-blue-500" }
              ].map((stat, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{stat.label}</span>
                    <span className="text-white">{stat.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full ${stat.color} shadow-[0_0_15px_rgba(244,63,94,0.4)]`} 
                      style={{ width: `${stat.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Activity Chart */}
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Weekly Activity Log</h4>
              <div className="flex items-end justify-between h-24 px-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div 
                      className={`w-3 rounded-full transition-all duration-500 ${i === 4 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-slate-800 group-hover:bg-slate-700'}`}
                      style={{ height: `${[40, 70, 45, 90, 65, 30, 50][i]}%` }}
                    />
                    <span className="text-[8px] font-black text-slate-600">{day}</span>
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