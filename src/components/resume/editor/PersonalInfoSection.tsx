"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resumeStore";
import { Sparkles } from "lucide-react";

export function PersonalInfoSection() {
  const { content, updatePersonalInfo } = useResumeStore();
  const { personal } = content;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold mb-1">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          Your contact details and professional summary
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={personal.fullName}
            onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={personal.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={personal.location}
            onChange={(e) => updatePersonalInfo({ location: e.target.value })}
            placeholder="Mumbai, India"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            type="url"
            value={personal.linkedin || ""}
            onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            type="url"
            value={personal.github || ""}
            onChange={(e) => updatePersonalInfo({ github: e.target.value })}
            placeholder="https://github.com/johndoe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary">Professional Summary</Label>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            <Sparkles className="w-3 h-3 mr-1" />
            Generate with AI
          </Button>
        </div>
        <Textarea
          id="summary"
          value={personal.summary || ""}
          onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
          placeholder="Write a compelling 2-3 sentence summary of your professional background and career goals..."
          className="min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground">
          {personal.summary?.length || 0} characters (recommended: 150-300)
        </p>
      </div>
    </div>
  );
}
