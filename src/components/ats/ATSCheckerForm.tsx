"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";

interface ATSCheckerFormProps {
  onSubmit: (data: {
    resumeText?: string;
    resumeFile?: string;
    jobDescription: string;
    companyName?: string;
    jobTitle?: string;
  }) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export function ATSCheckerForm({
  onSubmit,
  isLoading,
  error,
  className,
}: ATSCheckerFormProps) {
  const [resumeText, setResumeText] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [jobDescription, setJobDescription] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setResumeFile(base64);
        setResumeText("");
        setValidationError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const removeFile = () => {
    setResumeFile(null);
    setFileName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!jobDescription || jobDescription.length < 50) {
      setValidationError("Job description must be at least 50 characters");
      return;
    }

    if (!resumeText && !resumeFile) {
      setValidationError("Please paste your resume text or upload a file");
      return;
    }

    await onSubmit({
      resumeText: resumeText || undefined,
      resumeFile: resumeFile || undefined,
      jobDescription,
      companyName: companyName || undefined,
      jobTitle: jobTitle || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste Resume Text</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4">
          <Textarea
            placeholder="Paste your resume text here...&#10;&#10;Example:&#10;John Doe&#10;Software Engineer&#10;john.doe@email.com | +91 98765 43210&#10;&#10;Experience&#10;Software Engineer at ABC Corp (2022-Present)&#10;- Developed web applications using React and Node.js&#10;- Improved system performance by 40%..."
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (e.target.value) {
                setResumeFile(null);
                setFileName(null);
              }
              setValidationError(null);
            }}
            className="min-h-[300px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          {resumeFile ? (
            <div className="flex items-center justify-between p-4 rounded-lg border bg-success/5 border-success/20">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-success" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">Ready to analyze</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, DOC, DOCX, TXT (max 5MB)
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Job Description <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Paste the job description here...&#10;&#10;Tip: Copy directly from LinkedIn, Indeed, or Glassdoor job postings for best results."
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setValidationError(null);
          }}
          className="min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground">
          {jobDescription.length} characters (minimum 50 required)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name (Optional)</label>
          <Input
            placeholder="e.g., TCS, Google, Amazon"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Title (Optional)</label>
          <Input
            placeholder="e.g., Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
      </div>

      {(validationError || error) && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {validationError || error}
        </div>
      )}

      <Button
        type="submit"
        size="xl"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing Resume...
          </>
        ) : (
          <>
            Check ATS Score
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No account needed. Completely free. Results in 10 seconds.
      </p>
    </form>
  );
}
