import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MoreVertical, Trash2, Copy } from "lucide-react";

export default async function ResumeListPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Resumes</h1>
          <p className="text-muted-foreground">
            {resumes?.length || 0} resume{(resumes?.length || 0) !== 1 ? "s" : ""} created
          </p>
        </div>
        <Link href="/resume/new">
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Create New Resume
          </Button>
        </Link>
      </div>

      {resumes && resumes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-20 rounded bg-muted flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{resume.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {resume.target_role || "No target role"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {resume.template_id}
                        </Badge>
                        {resume.last_ats_score && (
                          <Badge
                            variant={
                              resume.last_ats_score >= 75
                                ? "success"
                                : resume.last_ats_score >= 50
                                ? "warning"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            ATS: {resume.last_ats_score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Updated{" "}
                    {new Date(resume.updated_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <Link href={`/resume/${resume.id}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Card */}
          <Card className="border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
            <Link href="/resume/new" className="block">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Create New Resume</h3>
                <p className="text-sm text-muted-foreground">
                  Start from scratch or use a template
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first ATS-optimized resume and start tracking your job applications
            </p>
            <Link href="/resume/new">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Resume
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
