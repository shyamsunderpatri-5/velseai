"use client";

/**
 * AddJobModal — Full-featured modal to add a job application to the tracker.
 * Uses React Hook Form + Zod validation.
 * Supports manual entry and pre-populated data from external jobs.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Briefcase,
  Building2,
  Link2,
  MapPin,
  DollarSign,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import type { JobApplication, JobStatus } from "@/types/jobs";

const addJobSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  jobDescription: z.string().optional(),
  status: z
    .enum([
      "saved",
      "applied",
      "phone_screen",
      "interview",
      "offer",
      "rejected",
      "withdrawn",
    ])
    .default("saved"),
  location: z.string().optional(),
  jobType: z.string().optional(),
  salaryMin: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : undefined)),
  salaryMax: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : undefined)),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
});

type AddJobFormData = {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  jobDescription?: string;
  status: JobStatus;
  location?: string;
  jobType?: string;
  salaryMin?: string;
  salaryMax?: string;
  appliedDate?: string;
  notes?: string;
};

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (job: JobApplication) => void;
  /** Pre-populate from external job (TheirStack / WhatsApp JD) */
  initialData?: Partial<AddJobFormData>;
  defaultStatus?: JobStatus;
}

export function AddJobModal({
  open,
  onClose,
  onSuccess,
  initialData,
  defaultStatus = "saved",
}: AddJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 2-step form for better UX

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AddJobFormData>({ defaultValues: { status: defaultStatus, ...initialData } as any });

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  const onSubmit = async (data: AddJobFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add job");
      }

      const { job } = await res.json();
      toast.success("Job added to tracker!");
      onSuccess(job);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] gap-0 p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Job Application
            </DialogTitle>
            <p className="text-white/70 text-sm mt-1">
              Track this opportunity in your Kanban board
            </p>
          </DialogHeader>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-white flex-1" : "bg-white/30 flex-1"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>Basic Info</span>
            <span>Details & Notes</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="flex items-center gap-1.5 text-sm font-medium">
                      <Building2 className="w-3.5 h-3.5 text-violet-500" />
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="e.g. Google, Stripe, Shopify"
                      {...register("companyName")}
                      className={errors.companyName ? "border-red-500" : ""}
                    />
                    {errors.companyName && (
                      <p className="text-xs text-red-500">{errors.companyName.message}</p>
                    )}
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle" className="flex items-center gap-1.5 text-sm font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-violet-500" />
                      Job Title *
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Senior Frontend Engineer"
                      {...register("jobTitle")}
                      className={errors.jobTitle ? "border-red-500" : ""}
                    />
                    {errors.jobTitle && (
                      <p className="text-xs text-red-500">{errors.jobTitle.message}</p>
                    )}
                  </div>

                  {/* Status + Location row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Status</Label>
                      <Select
                        defaultValue={defaultStatus}
                        onValueChange={(v: string) => setValue("status", v as JobStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saved">🔖 Saved</SelectItem>
                          <SelectItem value="applied">📤 Applied</SelectItem>
                          <SelectItem value="phone_screen">📞 Phone Screen</SelectItem>
                          <SelectItem value="interview">🎯 Interview</SelectItem>
                          <SelectItem value="offer">🎉 Offer</SelectItem>
                          <SelectItem value="rejected">❌ Rejected</SelectItem>
                          <SelectItem value="withdrawn">↩️ Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="w-3.5 h-3.5 text-violet-500" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="Berlin, Remote, NYC"
                        {...register("location")}
                      />
                    </div>
                  </div>

                  {/* Job URL */}
                  <div className="space-y-1.5">
                    <Label htmlFor="jobUrl" className="flex items-center gap-1.5 text-sm font-medium">
                      <Link2 className="w-3.5 h-3.5 text-violet-500" />
                      Job Posting URL
                    </Label>
                    <Input
                      id="jobUrl"
                      placeholder="https://jobs.company.com/..."
                      {...register("jobUrl")}
                      className={errors.jobUrl ? "border-red-500" : ""}
                    />
                    {errors.jobUrl && (
                      <p className="text-xs text-red-500">{errors.jobUrl.message}</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Salary Range */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-violet-500" />
                      Salary Range
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min (e.g. 80000)"
                        type="number"
                        {...register("salaryMin")}
                      />
                      <Input
                        placeholder="Max (e.g. 120000)"
                        type="number"
                        {...register("salaryMax")}
                      />
                    </div>
                  </div>

                  {/* Applied Date + Job Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="appliedDate" className="text-sm font-medium">
                        Applied Date
                      </Label>
                      <Input
                        id="appliedDate"
                        type="date"
                        {...register("appliedDate")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Job Type</Label>
                      <Select onValueChange={(v) => setValue("jobType", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="jobDescription" className="flex items-center gap-1.5 text-sm font-medium">
                      <FileText className="w-3.5 h-3.5 text-violet-500" />
                      Job Description
                      <span className="text-xs text-muted-foreground font-normal ml-1">(for ATS scoring)</span>
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here to enable ATS scoring..."
                      rows={4}
                      {...register("jobDescription")}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Recruiter name, referral, things to prepare..."
                      rows={2}
                      {...register("notes")}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? handleClose : () => setStep(1)}
              disabled={loading}
            >
              {step === 1 ? "Cancel" : "← Back"}
            </Button>

            {step === 1 ? (
              <Button
                type="button"
                onClick={() => {
                  const companyName = watch("companyName");
                  const jobTitle = watch("jobTitle");
                  if (!companyName || !jobTitle) {
                    toast.error("Company name and job title are required");
                    return;
                  }
                  setStep(2);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Next: Details →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Add Job</>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
