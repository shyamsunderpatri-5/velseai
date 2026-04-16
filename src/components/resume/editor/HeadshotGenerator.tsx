"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  Loader2, 
  Zap, 
  AlertCircle, 
  RefreshCw,
  Plus,
  ShieldCheck,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resumeStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { HeadshotStyle, HEADSHOT_STYLES } from "@/lib/ai/headshot";

interface HeadshotGeneratorProps {
  resumeId: string;
  currentPhoto?: string | null;
  onPhotoGenerated: (url: string) => void;
  className?: string;
}

export function HeadshotGenerator({ 
  resumeId, 
  currentPhoto, 
  onPhotoGenerated, 
  className 
}: HeadshotGeneratorProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [selectedStyle, setSelectedStyle] = React.useState<HeadshotStyle>("corporate");
  const [predictionId, setPredictionId] = React.useState<string | null>(null);
  const supabase = createClient();

  // Polling for prediction status
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (generating && predictionId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ai/headshot/status/${predictionId}`);
          const data = await res.json();

          if (data.status === "succeeded") {
            setGenerating(false);
            setPredictionId(null);
            onPhotoGenerated(data.output);
            toast.success("AI Headshot Materialized ✦");
          } else if (data.status === "failed") {
            setGenerating(false);
            setPredictionId(null);
            toast.error("Generation protocol failed. Please try again.");
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [generating, predictionId, onPhotoGenerated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const startGeneration = async () => {
    if (!file) return;
    setLoading(true);
    setGenerating(true);

    try {
      // 1. Upload source file to Supabase (temporary)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth required");

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("headshots")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("headshots")
        .getPublicUrl(filePath);

      // 2. Start Replicate Job
      const res = await fetch("/api/ai/headshot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: publicUrl,
          style: selectedStyle,
          resumeId
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setPredictionId(data.predictionId);
      toast.loading("VELSEAI AI-Engine: Synthesizing Professional Identity...", { duration: 10000 });

    } catch (err: any) {
      toast.error(err.message || "Synthesis Protocol Error.");
      setGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">
            AI Headshot Protocol
          </h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Professional Identity Synthesis • Replicate tencentarc/photomaker
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-600/10 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Elite Tech Stack</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Upload & Preview */}
        <div className="space-y-6">
          <div className="relative group aspect-square rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-violet-500/20">
            {currentPhoto || preview ? (
              <>
                <img 
                  src={preview || currentPhoto!} 
                  alt="Headshot Source" 
                  className="w-full h-full object-cover transition-all group-hover:scale-105 group-hover:blur-[2px]" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => document.getElementById('headshot-upload')?.click()}>
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Identity Source</span>
                  </div>
                </div>
              </>
            ) : (
              <label 
                htmlFor="headshot-upload" 
                className="flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-violet-600 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">
                  <Camera className="w-7 h-7 text-white/40 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-white uppercase tracking-widest">Upload Source Image</p>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">Clear face photo recommended</p>
                </div>
              </label>
            )}
            <input 
              id="headshot-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />

            {generating && (
              <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-600 blur-[40px] opacity-30 animate-pulse" />
                  <Loader2 className="w-12 h-12 text-violet-500 animate-spin relative z-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-white uppercase tracking-widest">AI Synthesis In Progress</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Calculating weights... Mapping facial features... Applying style layers...
                  </p>
                  <div className="w-48 h-1 bg-white/10 rounded-full mx-auto mt-4 overflow-hidden">
                    <motion.div 
                      className="h-full bg-violet-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 45, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Styles & Action */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] pl-1">Output Style Selection</h4>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(HEADSHOT_STYLES) as HeadshotStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  disabled={generating}
                  className={cn(
                    "relative p-4 rounded-2xl border transition-all text-left group overflow-hidden",
                    selectedStyle === style 
                      ? "bg-violet-600 border-violet-500 shadow-xl shadow-violet-600/20" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/15"
                  )}
                >
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] relative z-10 transition-colors",
                    selectedStyle === style ? "text-white" : "text-white/40 group-hover:text-white/70"
                  )}>
                    {style}
                  </div>
                  {selectedStyle === style && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-white/5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-widest">Protocol Clearance</p>
                <p className="text-[9px] text-white/30 font-bold leading-relaxed uppercase tracking-wider">
                  The AI-generated asset will be authorized for rejection-proof export across 90% of global ATS networks.
                </p>
              </div>
            </div>

            <Button
              onClick={startGeneration}
              disabled={!file || generating}
              className="w-full h-14 bg-white text-black hover:bg-violet-600 hover:text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all"
            >
              {generating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Locked In Process</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Elite Headshot</>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3 px-2">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
              * Note: High-fidelity generation typically completes in 45-60 seconds depending on compute availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
