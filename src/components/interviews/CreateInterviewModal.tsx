"use client";

import React, { useState } from "react";
import { 
  X, 
  ChevronRight, 
  Brain, 
  Briefcase, 
  Building2, 
  FileText, 
  Loader2,
  Zap,
  ShieldCheck
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string) => void;
}

export function CreateInterviewModal({ isOpen, onClose, onSuccess }: CreateInterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    difficulty: "mid-level",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.companyName || !formData.jobDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "start",
          ...formData
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview");

      toast.success("Ready! Initializing technical lead...");
      onSuccess(data.sessionId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white dark:bg-slate-950 border-white/10 p-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Briefcase className="w-24 h-24" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Configure Interview Round
            </DialogTitle>
            <DialogDescription className="text-violet-100/80 font-medium">
              Provide the job details so our AI can prepare relevant technical challenges.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" /> Company Name
              </Label>
              <Input 
                placeholder="e.g. Google, Stripe, Tesla" 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-500" /> Job Title
              </Label>
              <Input 
                placeholder="e.g. Frontend Engineer" 
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500" /> Target Difficulty
            </Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(val) => setFormData({...formData, difficulty: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior / Entry Level</SelectItem>
                <SelectItem value="mid-level">Mid-Level / Software Engineer II</SelectItem>
                <SelectItem value="senior">Senior Software Engineer</SelectItem>
                <SelectItem value="lead">Staff / Tech Lead</SelectItem>
                <SelectItem value="architect">System Architect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" /> Job Description (or requirements)
            </Label>
            <Textarea 
              placeholder="Paste the job requirements here..." 
              className="min-h-[150px] bg-slate-50 border-slate-200 focus:bg-white resize-none"
              value={formData.jobDescription}
              onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
              required
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl h-11"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-violet-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Initializing...
                </>
              ) : (
                <>
                   Enter Round <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
