"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Target,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";

const STEPS = [
  { id: "role", label: "Your Role", icon: User },
  { id: "field", label: "Your Field", icon: Briefcase },
  { id: "target", label: "Target Role", icon: Target },
  { id: "resume", label: "Upload Resume", icon: Upload },
];

const ROLE_OPTIONS = [
  { value: "fresher", label: "Fresher / Recent Graduate" },
  { value: "experienced", label: "Experienced Professional" },
  { value: "career_change", label: "Career Changer" },
  { value: "student", label: "Student / Intern" },
];

const FIELD_OPTIONS = [
  { value: "engineering", label: "Engineering / Tech" },
  { value: "mba", label: "MBA / Management" },
  { value: "design", label: "Design / Creative" },
  { value: "sales", label: "Sales / Marketing" },
  { value: "finance", label: "Finance / Accounting" },
  { value: "other", label: "Other" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    role: "",
    field: "",
    targetRole: "",
    resumeFile: null as File | null,
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      await supabase
        .from("profiles")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      toast.success("Welcome to VELSEAI!");
      router.push("/resume/new");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!formData.role;
      case 1:
        return !!formData.field;
      case 2:
        return !!formData.targetRole;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    i <= step
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">
              {step === 0 && "What describes you best?"}
              {step === 1 && "What's your field?"}
              {step === 2 && "What's your target role?"}
              {step === 3 && "Ready to build your resume!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 0: Role */}
            {step === 0 && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 1: Field */}
            {step === 1 && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.field}
                  onValueChange={(value) => setFormData({ ...formData, field: value })}
                >
                  {FIELD_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Target Role */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Job Title</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll optimize your resume for this role
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-success" />
                </div>
                <p className="text-muted-foreground">
                  You're all set! Click below to create your first ATS-optimized resume.
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on your selections, we'll recommend the best template for your {formData.field} career in {formData.targetRole}.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-accent hover:bg-accent/90"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Get Started
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}