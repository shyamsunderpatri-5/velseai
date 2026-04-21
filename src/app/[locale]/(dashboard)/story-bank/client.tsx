"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Clock, 
  Tag,
  Lightbulb,
  Zap,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection?: string;
  themes: string[];
  is_master: boolean;
  created_at: string;
}

export function StoryBankClient({ user, initialStories }: { user: { id: string }, initialStories: Story[] }) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.themes.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleMaster = async (id: string, current: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("interview_stories")
      .update({ is_master: !current })
      .eq("id", id);

    if (error) {
       toast.error("Protocol error: Failed to toggle master status");
    } else {
       setStories(stories.map(s => s.id === id ? { ...s, is_master: !current } : s));
       toast.success(!current ? "Asset promoted to Master Story" : "Asset demoted from Master");
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this intelligence asset?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("interview_stories").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete asset");
    } else {
      setStories(stories.filter(s => s.id !== id));
      toast.success("Intelligence asset purged");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 px-4 pb-24">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                 <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Story Bank</h1>
           </div>
           <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed max-w-xl">
             Your persistent library of behavioral proof points. These assets are automatically generated from your job audits.
           </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-500 transition-colors" />
             <Input 
               placeholder="SEARCH THEMES OR TITLES..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-10 h-10 w-full md:w-64 bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest focus:border-violet-500/50 transition-all"
             />
          </div>
          <Button className="h-10 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-[10px] px-6 rounded-xl shadow-lg shadow-violet-600/20">
             <Plus className="w-4 h-4 mr-2" /> NEW ASSET
          </Button>
        </div>
      </div>

      {/* ── STATS / QUICK ACCESS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <StatsCard label="Total Assets" value={stories.length} icon={<Target className="w-4 h-4" />} />
         <StatsCard label="Master Stories" value={stories.filter(s => s.is_master).length} icon={<Star className="w-4 h-4" />} color="text-amber-500" />
         <StatsCard label="Success Themes" value={new Set(stories.flatMap(s => s.themes)).size} icon={<Tag className="w-4 h-4" />} />
         <StatsCard label="Recent Updates" value={stories.filter(s => new Date(s.created_at) > new Date(Date.now() - 86400000 * 7)).length} icon={<Clock className="w-4 h-4" />} />
      </div>

      {/* ── STORY LIST ── */}
      <div className="space-y-4">
        {filteredStories.length === 0 ? (
          <div className="p-20 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600">
                <Zap className="w-8 h-8" />
             </div>
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">No intelligence assets found matching your criteria</p>
          </div>
        ) : (
          filteredStories.map((story) => (
            <div 
              key={story.id}
              className={cn(
                "group rounded-3xl border transition-all duration-500 overflow-hidden",
                expandedId === story.id 
                  ? "bg-white/[0.03] border-violet-500/30 shadow-2xl shadow-violet-500/10" 
                  : "bg-black/40 border-white/5 hover:border-white/20"
              )}
            >
              <div 
                className="p-6 cursor-pointer flex items-center justify-between gap-4"
                onClick={() => setExpandedId(expandedId === story.id ? null : story.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                   <div 
                     onClick={(e) => { e.stopPropagation(); toggleMaster(story.id, story.is_master); }}
                     className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                       story.is_master ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-white/5 text-zinc-700 hover:text-white border border-white/5"
                     )}
                   >
                     <Star className={cn("w-5 h-5", story.is_master && "fill-current")} />
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{story.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                         {story.themes.map(tag => (
                           <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                             {tag}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                   <div className="hidden sm:block text-right">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Created</p>
                      <p className="text-[10px] font-bold text-zinc-400">
                        {new Date(story.created_at).toLocaleDateString()}
                      </p>
                   </div>
                   <div className="p-2 rounded-xl bg-white/5 text-zinc-500 group-hover:text-white transition-colors">
                      {expandedId === story.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                   </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === story.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5">
                       <div className="space-y-6">
                          <StoryPillar label="SITUATION" text={story.situation} />
                          <StoryPillar label="TASK" text={story.task} />
                          <StoryPillar label="ACTION" text={story.action} />
                       </div>
                       <div className="space-y-6">
                          <StoryPillar label="RESULT" text={story.result} />
                          {story.reflection && (
                            <div className="p-4 rounded-2xl bg-violet-600/5 border border-violet-500/20 space-y-2">
                               <div className="flex items-center gap-2">
                                  <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
                                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em]">Strategic Reflection</span>
                               </div>
                               <p className="text-[11px] leading-relaxed text-zinc-300 font-medium italic">
                                 {story.reflection}
                               </p>
                            </div>
                          )}
                          <div className="pt-4 flex items-center justify-end">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               onClick={() => deleteStory(story.id)}
                               className="text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-widest h-8 rounded-lg"
                             >
                               <Trash2 className="w-3.5 h-3.5 mr-2" /> PURGE ASSET
                             </Button>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color = "text-zinc-500" }: { label: string, value: number, icon: any, color?: string }) {
  return (
    <div className="p-5 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-between">
       <div className="space-y-1">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-white">{value}</p>
       </div>
       <div className={cn("p-2.5 rounded-xl bg-white/5", color)}>
          {icon}
       </div>
    </div>
  );
}

function StoryPillar({ label, text }: { label: string, text: string }) {
  return (
    <div className="space-y-2">
       <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block">{label}</span>
       <p className="text-[11px] leading-relaxed text-zinc-400 font-bold uppercase tracking-wide">
         {text}
       </p>
    </div>
  );
}
