import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Building2, MapPin, DollarSign, Calendar, MoreVertical } from "lucide-react";
import type { JobApplication } from "@/types/user";

const STATUS_CONFIG = {
  saved: { label: "Saved", color: "bg-gray-100 text-gray-700" },
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  phone_screen: { label: "Phone Screen", color: "bg-purple-100 text-purple-700" },
  interview: { label: "Interview", color: "bg-warning/20 text-warning" },
  offer: { label: "Offer", color: "bg-success/20 text-success" },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-500" },
};

export default async function JobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: jobs } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const stats = {
    total: jobs?.length || 0,
    applied: jobs?.filter((j: JobApplication) => j.status === "applied").length || 0,
    interviews: jobs?.filter((j: JobApplication) => j.status === "interview" || j.status === "phone_screen").length || 0,
    offers: jobs?.filter((j: JobApplication) => j.status === "offer").length || 0,
  };

  const jobsByStatus = jobs?.reduce((acc, job) => {
    if (!acc[job.status]) acc[job.status] = [];
    acc[job.status].push(job);
    return acc;
  }, {} as Record<string, JobApplication[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Job Tracker</h1>
          <p className="text-muted-foreground">
            Track your job applications and interviews
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{stats.applied}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold">{stats.interviews}</p>
              </div>
              <Calendar className="w-8 h-8 text-warning/70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold">{stats.offers}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      {jobs && jobs.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const statusJobs: JobApplication[] = jobsByStatus[status] || [];
              return (
                <div
                  key={status}
                  className="w-72 flex-shrink-0 bg-muted/30 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">{config.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {statusJobs.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {statusJobs.map((job: JobApplication) => (
                      <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {job.jobTitle}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {job.companyName}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </div>
                          )}
                          {job.salaryMin && job.salaryMax && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                            </div>
                          )}
                          {job.atsScore && (
                            <Badge
                              variant={
                                job.atsScore >= 75
                                  ? "success"
                                  : job.atsScore >= 50
                                  ? "warning"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              ATS: {job.atsScore}%
                            </Badge>
                          )}
                          {job.appliedDate && (
                            <p className="text-xs text-muted-foreground">
                              Applied: {new Date(job.appliedDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {statusJobs.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No jobs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No job applications yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start tracking your job search by adding your first application
            </p>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
