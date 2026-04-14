"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  ExternalLink, 
  Briefcase, 
  GraduationCap, 
  Code2,
  Award,
  Globe,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Send,
  ChevronRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

/**
 * Public Bio-Page / Portfolio
 * velseai.com/u/[username]
 */

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const [profile, setProfile] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactMode, setContactMode] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, [username]);

  const fetchPublicData = async () => {
    try {
      const res = await fetch(`/api/u/profile?username=${username}`);
      if (!res.ok) throw new Error("Profile not found");
      const data = await res.json();
      setProfile(data.profile);
      setResume(data.resume);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      username,
      senderEmail: formData.get("email"),
      senderName: formData.get("name"),
      message: formData.get("message"),
    };

    setSending(true);
    try {
      const res = await fetch("/api/u/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      toast.success("Message sent to " + profile.full_name);
      setContactMode(false);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
    </div>
  );

  if (!profile || !profile.bio_public) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <User className="w-10 h-10 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile Unavailable</h1>
      <p className="text-slate-500 max-w-md mt-2">
        The user may have disabled their public profile or it doesn't exist.
      </p>
      <Button variant="link" className="mt-4" onClick={() => window.location.href = "/"}>
        Back to VelseAI
      </Button>
    </div>
  );

  const content = resume?.content || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 md:p-8 selection:bg-violet-200 selection:text-violet-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl"
        >
          <div className="h-32 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />
          <div className="px-8 pb-8">
            <div className="relative -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-slate-900 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-slate-400">{profile.full_name?.[0] || "?"}</span>
                    )}
                  </div>
                </div>
                <div className="text-center md:text-left space-y-1 pb-2">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {profile.full_name} <CheckCircle2 className="w-5 h-5 text-violet-500" />
                  </h1>
                  <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1.5">
                    @{username} • {content.personal?.location || "Global Talent"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pb-2">
                 <Button 
                   onClick={() => setContactMode(true)}
                   className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl px-6"
                 >
                   <Mail className="w-4 h-4 mr-2" /> Contact Me
                 </Button>
                 <Button variant="outline" className="border-slate-200 dark:border-white/10 rounded-2xl">
                   <LinkIcon className="w-4 h-4" />
                 </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs opacity-50">About Me</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {profile.bio || content.summary || "No bio provided."}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs opacity-50">Core Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(content.skills || []).slice(0, 8).map((skill: string) => (
                    <Badge key={skill} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none rounded-lg px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs / Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Experience Feed */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 px-2">
               <Briefcase className="w-5 h-5 text-violet-500" />
               <h2 className="text-xl font-black text-slate-900 dark:text-white">Professional Journey</h2>
            </div>
            
            <div className="space-y-4">
              {(content.experience || []).map((exp: any, idx: number) => (
                <Card key={idx} className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                        <p className="text-violet-600 font-bold">{exp.company}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                        {exp.start_date} - {exp.end_date || "Present"}
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {(exp.bullets || []).map((bullet: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <div className="space-y-4">
               <div className="flex items-center gap-3 px-2">
                 <GraduationCap className="w-5 h-5 text-emerald-500" />
                 <h2 className="text-xl font-black text-slate-900 dark:text-white">Education</h2>
               </div>
               {(content.education || []).map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5">
                    <p className="font-bold text-slate-900 dark:text-white">{edu.degree}</p>
                    <p className="text-xs text-slate-400">{edu.institution} • {edu.graduation_year}</p>
                  </div>
               ))}
             </div>

             {content.projects && (
               <div className="space-y-4">
                 <div className="flex items-center gap-3 px-2">
                   <Code2 className="w-5 h-5 text-indigo-500" />
                   <h2 className="text-xl font-black text-slate-900 dark:text-white">Side Projects</h2>
                 </div>
                 {content.projects.slice(0, 3).map((proj: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        {proj.name} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">{proj.description}</p>
                    </div>
                 ))}
               </div>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="py-20 text-center space-y-4">
           <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-widest">
             <span>Live Portfolio</span>
             <div className="w-1 h-1 rounded-full bg-slate-400" />
             <span>Built on VelseAI</span>
           </div>
           <Button onClick={() => window.location.href = "/"} variant="ghost" className="text-violet-600 hover:text-violet-700 font-black">
             CREATE YOUR PUBLIC BIO-PAGE <ChevronRight className="w-4 h-4 ml-1" />
           </Button>
        </div>
      </div>

      {/* Contact Modal Layer */}
      <AnimatePresence>
        {contactMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recruiter Contact</h3>
                    <p className="text-sm text-slate-500">Send a direct message to {profile.full_name.split(' ')[0]}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setContactMode(false)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleContact} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase font-black tracking-widest opacity-50">Your Name</Label>
                      <Input name="name" placeholder="E.g. Technical Recruiter" required className="rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-xs uppercase font-black tracking-widest opacity-50">Work Email</Label>
                       <Input name="email" type="email" placeholder="name@company.com" required className="rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-black tracking-widest opacity-50">Message</Label>
                    <Textarea 
                      name="message" 
                      placeholder="Discuss hiring opportunities, collaboration, or share a JD link..." 
                      className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 resize-none" 
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black shadow-xl shadow-violet-500/20"
                    disabled={sending}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                  <p className="text-[10px] text-center text-slate-500 max-w-xs mx-auto">
                    Note: Your email will be visible to the user. VelseAI prevents spam & bulk recruiter crawlers.
                  </p>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
