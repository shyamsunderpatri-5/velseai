"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/stores/resumeStore";
import { AIPolisher } from "./AIPolisher";
import { Camera, User, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function PersonalInfoSection() {
  const { content, updatePersonalInfo } = useResumeStore();
  const { personal } = content;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo({ photo: reader.result as string });
        toast.success("Photo uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Elite Avatar Uploader */}
        <div className="relative group">
          <div 
            className="w-32 h-32 rounded-3xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10 group-hover:border-violet-500/50 transition-all duration-500 flex items-center justify-center cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
            {personal.photo ? (
              <img src={personal.photo} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <User className="w-10 h-10 text-white/10 group-hover:text-violet-500 transition-colors" />
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <Camera className="w-5 h-5 text-white" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white">Change</span>
            </div>
          </div>
          
          {personal.photo && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                updatePersonalInfo({ photo: null });
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
          />
        </div>

        <div className="flex-1 space-y-2 pt-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Protocol</h2>
          <p className="text-xs text-white/30 font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed">
            Initialize your professional silhouette. High-resolution imagery recommended for executive templates.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8 pt-6 border-t border-white/5">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="fullName">Legal Designation</Label>
          <Input
            id="fullName"
            value={personal.fullName}
            onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
            placeholder="John Doe"
            className="bg-white/[0.03] border-white/5 focus:border-violet-500/50 h-12 rounded-xl transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="email">Comms Channel</Label>
          <Input
            id="email"
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            placeholder="john@example.com"
            className="bg-white/[0.03] border-white/5 focus:border-violet-500/50 h-12 rounded-xl transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="phone">Direct Contact</Label>
          <Input
            id="phone"
            type="tel"
            value={personal.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            placeholder="+1 234 567 890"
            className="bg-white/[0.03] border-white/5 focus:border-violet-500/50 h-12 rounded-xl transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="location">Operating Base</Label>
          <Input
            id="location"
            value={personal.location}
            onChange={(e) => updatePersonalInfo({ location: e.target.value })}
            placeholder="New York, NY"
            className="bg-white/[0.03] border-white/5 focus:border-violet-500/50 h-12 rounded-xl transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="linkedin">Professional Node (LinkedIn)</Label>
          <Input
            id="linkedin"
            type="url"
            value={personal.linkedin || ""}
            onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/johndoe"
            className="bg-white/[0.03] border-white/5 focus:border-violet-500/50 h-12 rounded-xl transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="github">Operational Hub (Website/GitHub)</Label>
          <Input
            id="github"
            type="url"
            value={personal.github || ""}
            onChange={(e) => updatePersonalInfo({ github: e.target.value })}
            placeholder="johndoe.com"
            className="bg-white/[0.03] border-white/5 focus:border-violet-500/50 h-12 rounded-xl transition-all font-medium"
          />
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="summary">Executive Summary</Label>
            <p className="text-[8px] text-white/10 uppercase font-black mt-1">High-impact value proposition</p>
          </div>
          <AIPolisher 
            value={personal.summary || ""} 
            onUpdate={(val) => updatePersonalInfo({ summary: val })}
            context="Professional resume summary"
          />
        </div>
        <Textarea
          id="summary"
          value={personal.summary || ""}
          onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
          placeholder="Elite summary that highlights your core value proposition..."
          className="min-h-[160px] bg-white/[0.03] border-white/5 focus:border-violet-500/50 transition-all resize-none text-sm leading-relaxed rounded-2xl p-6"
        />
        <div className="flex justify-between items-center px-1">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
            {personal.summary?.length || 0} / 500 OCTETS
          </p>
          <div className="flex gap-1.5">
            <div className={cn("h-1 w-6 rounded-full transition-all duration-700", (personal.summary?.length || 0) > 150 ? "bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" : "bg-white/5")} />
            <div className={cn("h-1 w-6 rounded-full transition-all duration-700", (personal.summary?.length || 0) > 300 ? "bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" : "bg-white/5")} />
          </div>
        </div>
      </div>
    </div>
  );
}


