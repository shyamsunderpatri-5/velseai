"use client";

/**
 * DiscoverPageClient — Interactive external job discovery UI.
 * Fetches from /api/jobs/recent with real-time filter updates.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  RefreshCw,
  Loader2,
  Filter,
  Sparkles,
  AlertCircle,
  Wifi,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { DiscoverJobCard } from "./DiscoverJobCard";
import type { ExternalJob, UserJobPreferences } from "@/types/jobs";
import { toast } from "react-hot-toast";

interface DiscoverPageClientProps {
  preferences: UserJobPreferences | null;
  hasResume: boolean;
}

const LOCATION_PRESETS = [
  "Remote",
  "Berlin",
  "Munich",
  "London",
  "Paris",
  "Amsterdam",
  "New York",
  "San Francisco",
  "Bangalore",
  "Singapore",
];

export function DiscoverPageClient({ preferences, hasResume }: DiscoverPageClientProps) {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(preferences?.locations?.[0] || "Remote");
  const [skillsInput, setSkillsInput] = useState(
    (preferences?.skills || []).slice(0, 5).join(", ")
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [cached, setCached] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);

      try {
        const skills = skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const params = new URLSearchParams({
          location,
          ...(skills.length > 0 ? { skills: skills.join(",") } : {}),
          limit: "20",
          ...(forceRefresh ? { refresh: "true" } : {}),
        });

        const res = await fetch(`/api/jobs/recent?${params.toString()}`);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch jobs");
        }

        const data = await res.json();
        setJobs(data.jobs || []);
        setCached(data.cached || false);
        setLastFetched(new Date());

        if (forceRefresh) {
          toast.success(`Found ${data.jobs?.length || 0} fresh jobs`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load jobs";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [location, skillsInput]
  );

  // Initial fetch on mount using user preferences
  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleJobAdded = (job: ExternalJob) => {
    // In a real app we'd update a counter here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            Discover Jobs
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Personalized job openings from the last 7 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              {cached ? "Cached · " : ""}
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchJobs(true)}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search / Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {/* Location */}
              <div className="flex-1 min-w-[180px]">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (e.g. Berlin, Remote)"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="flex-[2] min-w-[220px]">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Skills (React, TypeScript, Python...)"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>

            {/* Location presets */}
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_PRESETS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    location === loc
                      ? "bg-violet-100 border-violet-400 text-violet-700"
                      : "border-muted hover:border-violet-300 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* No resume warning */}
      {!hasResume && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  No resume found
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Create a resume to get AI match scores for each job.
                </p>
              </div>
              <a href="/resume/new">
                <Button size="sm" variant="outline" className="text-xs gap-1 border-amber-300 text-amber-700">
                  Create Resume <ChevronRight className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{jobs.length}</span> jobs found
              {location && (
                <> in <span className="font-medium">{location}</span></>
              )}
              {cached && (
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                  cached
                </Badge>
              )}
            </p>
          </div>

          <AnimatePresence>
            <div className="grid sm:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <DiscoverJobCard
                  key={job.id}
                  job={job}
                  hasResume={hasResume}
                  onAddToTracker={handleJobAdded}
                />
              ))}
            </div>
          </AnimatePresence>
        </>
      ) : !error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Wifi className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No jobs found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Try a different location or broaden your skills filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setLocation("Remote");
                setSkillsInput("");
                setTimeout(() => fetchJobs(), 100);
              }}
            >
              Search Remote Jobs
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Save Preferences CTA */}
      {jobs.length > 0 && (
        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-violet-600" />
                <div>
                  <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">
                    Get daily job alerts
                  </p>
                  <p className="text-xs text-violet-700/70 dark:text-violet-400">
                    Save your preferences and we'll email matching jobs daily
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1"
                onClick={async () => {
                  const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
                  const res = await fetch("/api/user/preferences", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      locations: [location],
                      skills,
                      alertEmail: true,
                      alertFrequency: "daily",
                    }),
                  });
                  if (res.ok) {
                    toast.success("Job alert preferences saved! You'll get daily emails.");
                  } else {
                    toast.error("Failed to save preferences");
                  }
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Save & Enable Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
