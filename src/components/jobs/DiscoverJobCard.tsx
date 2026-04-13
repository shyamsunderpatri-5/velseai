"use client";

/**
 * DiscoverJobCard — Card component for external jobs from TheirStack/Adzuna.
 * Shows company, role, location, match score, skills, salary.
 * One-click "Add to Tracker" button adds to job_applications table.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Plus,
  Check,
  Loader2,
  Wifi,
  TrendingUp,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { ExternalJob } from "@/types/jobs";

interface DiscoverJobCardProps {
  job: ExternalJob;
  /** User's resume text for match scoring (optional) */
  hasResume?: boolean;
  onAddToTracker?: (job: ExternalJob) => void;
}

const SOURCE_LABEL: Record<ExternalJob["source"], string> = {
  theirstack: "TheirStack",
  adzuna: "Adzuna",
  remotive: "Remotive",
  mock: "Demo",
};

export function DiscoverJobCard({ job, hasResume, onAddToTracker }: DiscoverJobCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAddToTracker = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: job.company,
          jobTitle: job.title,
          jobUrl: job.url,
          jobDescription: job.description,
          location: job.location,
          jobType: job.job_type,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          status: "saved",
          source: job.source,
          externalJobId: job.id,
          matchScore: job.match_score,
        }),
      });

      if (!res.ok) throw new Error("Failed to add");

      setAdded(true);
      toast.success("Added to tracker!");
      onAddToTracker?.(job);
    } catch {
      toast.error("Failed to add to tracker");
    } finally {
      setAdding(false);
    }
  };

  const matchLevel =
    (job.match_score || 0) >= 80
      ? "excellent"
      : (job.match_score || 0) >= 60
      ? "good"
      : (job.match_score || 0) >= 40
      ? "fair"
      : "poor";

  const matchColor = {
    excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    good: "text-blue-600 bg-blue-50 border-blue-200",
    fair: "text-amber-600 bg-amber-50 border-amber-200",
    poor: "text-gray-500 bg-gray-50 border-gray-200",
  }[matchLevel];

  const daysSincePosted = Math.floor(
    (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="hover:shadow-md hover:border-violet-400/40 transition-all duration-200 group">
        <CardContent className="p-5">
          {/* Top row: logo + title + match score */}
          <div className="flex items-start gap-4">
            {/* Company logo / abbrev */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0 font-bold text-violet-700 text-lg shadow-inner">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                job.company.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate">{job.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium truncate">
                      {job.company}
                    </span>
                  </div>
                </div>

                {/* Match score badge */}
                {job.match_score && (
                  <div
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg border text-center ${matchColor}`}
                  >
                    <div className="text-lg font-bold leading-tight">{job.match_score}%</div>
                    <div className="text-[10px] leading-tight">match</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
              {job.is_remote && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700">
                  Remote
                </Badge>
              )}
            </div>

            {job.salary_min && job.salary_max && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salary_currency || "$"}
                {Math.round(job.salary_min / 1000)}k –{" "}
                {Math.round(job.salary_max / 1000)}k
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {daysSincePosted === 0
                ? "Today"
                : daysSincePosted === 1
                ? "Yesterday"
                : `${daysSincePosted}d ago`}
            </div>

            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {SOURCE_LABEL[job.source]}
            </Badge>
          </div>

          {/* Skills */}
          {job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.required_skills.slice(0, 6).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200/50"
                >
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 6 && (
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                  +{job.required_skills.length - 6}
                </Badge>
              )}
            </div>
          )}

          {/* Expandable description */}
          {job.description && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Hide" : "Show"} description
              </button>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-muted-foreground leading-relaxed max-h-40 overflow-y-auto"
                >
                  {job.description.slice(0, 600)}
                  {job.description.length > 600 && "..."}
                </motion.div>
              )}
            </div>
          )}

          {/* Match reasons */}
          {job.match_reasons && job.match_reasons.length > 0 && expanded && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Match analysis
              </p>
              {job.match_reasons.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span
                    className={
                      r.impact === "positive"
                        ? "text-emerald-500 font-bold"
                        : "text-red-500 font-bold"
                    }
                  >
                    {r.impact === "positive" ? "+" : "−"}
                  </span>
                  <span className="text-muted-foreground">{r.detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Button
              size="sm"
              className={`flex-1 text-sm transition-all ${
                added
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              }`}
              onClick={handleAddToTracker}
              disabled={adding || added}
            >
              {adding ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Adding...</>
              ) : added ? (
                <><Check className="w-3.5 h-3.5 mr-1.5" /> Added to Tracker</>
              ) : (
                <><Plus className="w-3.5 h-3.5 mr-1.5" /> Add to Tracker</>
              )}
            </Button>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              title="View original posting"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm" className="px-3">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
