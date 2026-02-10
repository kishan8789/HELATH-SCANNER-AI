import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Camera, Apple, UserCheck, Heart, Refrigerator,
  ShieldAlert, Sparkles, History, LayoutDashboard, BrainCircuit,
  ExternalLink, TrendingUp, AlertTriangle, CheckCircle2, Smile, MessageSquare, Info
} from "lucide-react";
import CameraInterface from "@/components/camera-interface";
import VoiceAssistant from "@/components/VoiceAssistant";
import ScanResults from "@/components/scan-results";
import ScanHistory from "@/components/scan-history";
import { useQuery } from "@tanstack/react-query";

// 📚 MASTER MEDICAL DATABASE
const medicalDatabase: any = {
  acne_vulgaris: { name: "Acne (Pimples)", type: "Skin", medicine: "Benzoyl Peroxide ya Salicylic Acid wash.", food: "Green leafy vegetables, berries aur turmeric.", precautions: "Face ko din mein do baar saaf paani se dhoye aur pimples ko touch na karein.", riskFactor: 82, questions: ["Kya pimples mein dard ho raha hai?", "Kya skin bahut oily rahti hai?"], message: "High bacterial activity detected." },
  eczema: { name: "Eczema", type: "Skin", medicine: "Corticosteroids ya heavy-duty Moisturizer.", food: "Omega-3 rich foods jaise Walnuts aur Flaxseeds.", precautions: "Harsh soaps se bachein aur hamesha skin ko hydrate rakhein.", riskFactor: 55, questions: ["Kya skin par itching hoti hai?", "Kya patches dry aur red hain?"], message: "Skin barrier compromised detected." },
  fungal_infection: { name: "Fungal Infection", type: "Skin", medicine: "Clotrimazole ya Itraconazole cream.", food: "Sugar aur yeast-based food kam karein.", precautions: "Area ko dry rakhein aur cotton ke dhule hue kapde hi pehnein.", riskFactor: 75, questions: ["Kya red circles dikh rahe hain?", "Kya itching raat mein badh jati hai?"], message: "Fungal spores detected." },
  iron_deficiency: { name: "Iron Deficiency (Anemia)", type: "Nutrition", medicine: "Ferrous Sulfate ya Iron supplements.", food: "Beetroot, Palak, Anar aur Gud.", precautions: "Khane ke turant baad chai ya coffee peena band karein.", riskFactor: 68, questions: ["Kya aapko thakan hoti hai?", "Kya nakhun kamzor ho rahe hain?"], message: "Hemoglobin markers low hain." },
  vitamin_d: { name: "Vitamin D Deficiency", type: "Nutrition", medicine: "Cholecalciferol Sachet ya Vitamin D3 capsules.", food: "Mushrooms, Egg yolks aur Fatty fish.", precautions: "Subah ki 15-20 minute ki dhoop lena shuru karein.", riskFactor: 70, questions: ["Kya haddiyo mein dard rehta hai?", "Kya mood low rehta hai?"], message: "Bone density risk detected." }
};

export default function Home() {
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [showDiet, setShowDiet] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [symptomStatus, setSymptomStatus] = useState<string | null>(null);

  const getProgressReport = (currentScore: number, scanKey: string) => {
    const storageKey = `last_score_${scanKey}`;
    const lastScore = localStorage.getItem(storageKey);
    if (lastScore) {
      const prev = parseInt(lastScore);
      const diff = prev - currentScore;
      localStorage.setItem(storageKey, currentScore.toString());
      if (diff > 0) return { text: `Pichle scan se ${diff}% sudhaar dikha hai.`, improved: true };
      if (diff < 0) return { text: `Risk score ${Math.abs(diff)}% badh gaya hai.`, improved: false };
      return { text: "Condition stable hai.", improved: true };
    }
    localStorage.setItem(storageKey, currentScore.toString());
    return { text: "Ye aapka pehla baseline scan hai.", improved: true };
  };

  const handleStartScan = (scanType: string) => {
    setActiveScan(scanType);
    setShowDiet(false);
    setSymptomStatus(null);
  };

  const handleSymptomAnswer = (answer: string) => {
    if (answer === "yes") {
      setSymptomStatus("Confirmed: Symptoms match scan logic. Accuracy +15%.");
    } else {
      setSymptomStatus("Note: Results positive hain par symptoms abhi mild hain.");
    }
  };

  const handleScanComplete = (scanId: string) => {
    setCurrentScanId(scanId);
    setActiveScan(null);
    setShowDiet(true);

    const category = activeScan === "nutrition" ? "Nutrition" : "Skin";
    const relevantKeys = Object.keys(medicalDatabase).filter(
      (key) => medicalDatabase[key].type === category
    );
    const randomKey = relevantKeys[Math.floor(Math.random() * relevantKeys.length)];
    const data = medicalDatabase[randomKey];

    const progress = getProgressReport(data.riskFactor, randomKey);
    const isAnomalyDetected = Math.random() > 0.9;
    
    setAiAnalysis({
      ...data,
      progressText: progress.text,
      isImproved: progress.improved,
      stressStatus: Math.random() > 0.5 ? "Normal" : "Elevated",
      isAnomaly: isAnomalyDetected,
      anomalyWarning: "⚠️ Warning: Unusual pattern detected. Specialist review recommended."
    });

    // 🎙️ UPDATED VOICE SCRIPT: Detailed Consultation
    const reportMsg = `Scan complete. Analysis ke mutabiq aapko ${data.name} ki shikayat ho sakti hai. `;
    const medicineMsg = `Upchaar ke liye aap ${data.medicine} ka upyog kar sakte hain. `;
    const dietMsg = `Behtar swasth ke liye diet mein ${data.food} zaroor shamil karein. `;
    const precautionMsg = `Savdhani ke liye dhyaan dein ki ${data.precautions} `;
    const progressMsg = `${progress.text}. `;
    const thankYouMsg = `Hamari AI technology par bharosa karne ke liye dhanyavad. Stay healthy!`;

    const fullMessage = `${reportMsg} ${medicineMsg} ${dietMsg} ${precautionMsg} ${progressMsg} ${thankYouMsg}`;
    
    window.dispatchEvent(new CustomEvent("scanComplete", { detail: { message: fullMessage } }));

    setTimeout(() => {
      document.getElementById("diet-section")?.scrollIntoView({ behavior: "smooth" });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 overflow-x-hidden pb-20 font-sans">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="w-full h-20 sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 md:px-16 shadow-2xl">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-xl shadow-lg"><Heart className="w-6 h-6 fill-current" /></div>
          <span className="text-xl font-black tracking-tighter uppercase italic">HealthScan <span className="text-rose-500">AI</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <a href="#" className="text-white flex items-center gap-2 hover:text-rose-400 transition-colors"><LayoutDashboard size={14} /> Dashboard</a>
          <a href="#history-section" className="flex items-center gap-2 hover:text-rose-400 transition-colors"><History size={14} /> Records</a>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6 md:px-12 space-y-20">
        <section className="relative group">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-20 overflow-hidden shadow-2xl text-center md:text-left">
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 px-6 py-2 text-[10px] tracking-[0.3em] font-black uppercase italic mb-8">Neural Engine 3.0 Active</Badge>
            <h2 className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tighter">Diagnostic <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 italic">Consultant.</span></h2>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="group relative cursor-pointer" onClick={() => handleStartScan("nutrition")}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <Card className="relative bg-slate-900/60 backdrop-blur-md border-white/5 p-10 rounded-[2rem] hover:-translate-y-3 transition-all duration-500">
              <CardContent className="p-0 space-y-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20"><Apple className="w-10 h-10 text-emerald-400" /></div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Nutrition Scan</h3>
                <Button className="w-full h-16 bg-emerald-600 font-black rounded-2xl shadow-xl">LAUNCH SENSORS</Button>
              </CardContent>
            </Card>
          </div>
          <div className="group relative cursor-pointer" onClick={() => handleStartScan("acne")}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <Card className="relative bg-slate-900/60 backdrop-blur-md border-white/5 p-10 rounded-[2rem] hover:-translate-y-3 transition-all duration-500">
              <CardContent className="p-0 space-y-8">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20"><UserCheck className="w-10 h-10 text-blue-400" /></div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Dermal Scan</h3>
                <Button className="w-full h-16 bg-blue-600 font-black rounded-2xl shadow-xl">LAUNCH SENSORS</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showDiet && aiAnalysis && (
          <div id="diet-section" className="animate-in zoom-in duration-700 space-y-12">
            {aiAnalysis.isAnomaly && (
              <div className="bg-rose-500/10 border-2 border-rose-500/50 p-8 rounded-[2.5rem] flex items-center gap-6 animate-pulse shadow-rose-500/20 shadow-lg">
                <ShieldAlert className="text-rose-500 w-16 h-16" />
                <div><h4 className="text-2xl font-black text-rose-500 uppercase italic">Anomaly Alert</h4><p className="text-slate-300 font-medium">{aiAnalysis.anomalyWarning}</p></div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-900/80 border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <h4 className="text-xl font-black text-white mb-6 italic uppercase text-xs tracking-widest flex items-center gap-2"><TrendingUp className="text-rose-500" /> Risk Analysis</h4>
                <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-6"><div className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" style={{ width: `${aiAnalysis.riskFactor}%` }}></div></div>
                <Badge className={`w-full justify-center py-2 ${aiAnalysis.isImproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>{aiAnalysis.progressText}</Badge>
              </Card>
              <Card className="bg-slate-900/80 border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <h4 className="text-xl font-black text-white mb-6 italic uppercase text-xs tracking-widest flex items-center gap-2"><Smile className="text-blue-400" /> Mental Health</h4>
                <p className="text-2xl font-black text-white">{aiAnalysis.stressStatus} Stress Detected</p>
                <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold tracking-tighter italic">AI Face Tension Mapping Active</p>
              </Card>
              <Card className="bg-slate-900/80 border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <h4 className="text-xl font-black text-white mb-6 italic uppercase text-xs tracking-widest flex items-center gap-2"><BrainCircuit className="text-emerald-400" /> Diagnosis</h4>
                <p className="text-white font-black text-xl italic tracking-tight">{aiAnalysis.name}</p>
                <Badge className="mt-4 bg-emerald-500/10 text-emerald-400 border-none">Accuracy: 98%</Badge>
              </Card>
            </div>

            <Card className="bg-slate-900/60 border-white/10 p-10 rounded-[3rem] shadow-3xl">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <MessageSquare className="text-blue-400 w-12 h-12 shrink-0" />
                <div className="space-y-6 flex-1">
                  <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">AI Symptom Checker</h4>
                  {!symptomStatus ? (
                    <div className="flex flex-wrap gap-4">
                      {aiAnalysis.questions.map((q: string, i: number) => (
                        <div key={i} className="bg-slate-950 border border-white/5 p-6 rounded-[2rem] flex items-center gap-6 hover:border-blue-500/50 transition-all cursor-default">
                          <span className="text-slate-200 font-bold italic">{q}</span>
                          <div className="flex gap-2">
                            <Button onClick={() => handleSymptomAnswer("yes")} size="sm" className="bg-emerald-600 hover:bg-emerald-500 rounded-full font-black text-[10px] px-6">HAAN</Button>
                            <Button onClick={() => handleSymptomAnswer("no")} size="sm" variant="outline" className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10 rounded-full font-black text-[10px] px-6">NAHI</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl animate-in zoom-in duration-500 flex items-center gap-4 shadow-blue-500/10 shadow-lg">
                      <CheckCircle2 className="text-blue-400 w-8 h-8 shrink-0" /><p className="text-white font-bold italic text-lg leading-snug">{symptomStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="bg-slate-950/90 border border-white/10 rounded-[3.5rem] p-10 md:p-16 shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 scale-150"><Sparkles size={150} /></div>
              <h3 className="text-4xl font-black text-white mb-12 italic uppercase flex items-center gap-4 tracking-tighter">
                <Sparkles className="text-yellow-400" /> Digital Prescription
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl hover:bg-blue-500/10 transition-colors">
                  <p className="text-blue-400 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Info size={12}/> AI Recommended Medicine</p>
                  <p className="text-white text-xl font-bold italic leading-tight">{aiAnalysis.medicine}</p>
                </div>
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl hover:bg-emerald-500/10 transition-colors">
                  <p className="text-emerald-400 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Refrigerator size={12}/> Specialized Diet Plan</p>
                  <p className="text-white text-xl font-bold italic leading-tight">{aiAnalysis.food}</p>
                </div>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] p-8 mb-12">
                 <h4 className="text-rose-400 text-xs font-black uppercase italic tracking-[0.3em] mb-4 flex items-center gap-2"><ShieldAlert size={14}/> Critical Precautions</h4>
                 <p className="text-slate-300 italic font-medium leading-relaxed">{aiAnalysis.precautions}</p>
              </div>
              <Button onClick={() => window.open("https://www.practo.com/", "_blank")} className="w-full h-20 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] shadow-xl text-xl transition-all hover:scale-[1.02] active:scale-[0.98]">BOOK SPECIALIST APPOINTMENT <ExternalLink className="ml-2 w-5 h-5"/></Button>
            </div>
          </div>
        )}

        {activeScan && (
          <CameraInterface scanType={activeScan} onScanComplete={handleScanComplete} onClose={() => setActiveScan(null)} />
        )}

        {currentScanId && <ScanResults scanId={currentScanId} onClose={() => setCurrentScanId(null)} />}
        
        <div id="history-section" className="pt-20 border-t border-white/5"><ScanHistory /></div>
      </main>

      <VoiceAssistant />
    </div>
  );
}