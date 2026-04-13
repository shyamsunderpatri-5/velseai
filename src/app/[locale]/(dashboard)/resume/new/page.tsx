"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_RESUME_CONTENT, DEFAULT_RESUME_SETTINGS } from "@/types/resume";
import { Loader2, Sparkles, FileText, Target } from "lucide-react";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean design with sidebar",
    color: "bg-navy",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional single-column",
    color: "bg-gray-700",
  },
  {
    id: "creative",
    name: "Creative",
    description: "For design & marketing",
    color: "bg-purple-600",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean and simple",
    color: "bg-gray-500",
  },
  {
    id: "tech",
    name: "Tech",
    description: "For developers",
    color: "bg-green-600",
  },
];

export default function NewResumePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [targetRole, setTargetRole] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState("modern");

  const handleCreate = async () => {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const { data: existingResumes } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id);

    const resumeLimit = profile?.plan === "free" ? 1 : profile?.plan === "starter" ? 5 : 999;

    if ((existingResumes?.length || 0) >= resumeLimit) {
      alert(`Your ${profile?.plan} plan allows up to ${resumeLimit} resumes. Please upgrade to create more.`);
      setIsLoading(false);
      return;
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title || "Untitled Resume",
        template_id: selectedTemplate,
        target_role: targetRole || null,
        content: DEFAULT_RESUME_CONTENT,
        settings: {
          ...DEFAULT_RESUME_SETTINGS,
          templateId: selectedTemplate,
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating resume:", error);
      setIsLoading(false);
      return;
    }

    router.push(`/resume/${resume.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold">Create New Resume</h1>
        <p className="text-muted-foreground">
          Choose a template and get started building your ATS-optimized resume
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Give your resume a name and specify your target role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              placeholder="e.g., Software Engineer Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRole">
              Target Role{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="targetRole"
                placeholder="e.g., Full Stack Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll use this to suggest relevant keywords and optimize your ATS score
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Choose a Template
          </CardTitle>
          <CardDescription>
            Select a template that fits your industry and style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === template.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-14 rounded ${template.color} flex items-center justify-center`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <Badge className="absolute top-2 right-2 bg-accent">Selected</Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={isLoading}
          className="bg-accent hover:bg-accent/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create Resume
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
