"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

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
  initialValue?: {
    jobDescription?: string;
    companyName?: string;
    jobTitle?: string;
  };
}

export function ATSCheckerForm({
  onSubmit,
  isLoading,
  error,
  className,
  initialValue,
}: ATSCheckerFormProps) {
  const [resumeText, setResumeText] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [jobDescription, setJobDescription] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [scrapingUrl, setScrapingUrl] = React.useState("");
  const [isScraping, setIsScraping] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Sync with initialValue for Discovery Leads
  React.useEffect(() => {
    if (initialValue) {
      if (initialValue.jobDescription) setJobDescription(initialValue.jobDescription);
      if (initialValue.companyName) setCompanyName(initialValue.companyName);
      if (initialValue.jobTitle) setJobTitle(initialValue.jobTitle);
    }
  }, [initialValue]);

  const handleScrape = async () => {
    if (!scrapingUrl) return;
    setIsScraping(true);
    setValidationError(null);

    try {
      const res = await fetch("/api/ai/scrape-linkedin-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapingUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");

      if (data.job_description) setJobDescription(data.job_description);
      if (data.company_name) setCompanyName(data.company_name);
      if (data.job_title) setJobTitle(data.job_title);
      
      // Feedback to user
      setValidationError(null);
    } catch (err: any) {
      console.error("Scrape failed:", err);
      setValidationError(`Scrape blocked by LinkedIn security. Please paste manually.`);
    } finally {
      setIsScraping(false);
    }
  };

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
    <form onSubmit={handleSubmit} className={cn("space-y-2", className)}>
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste Resume Text</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-1">
          <Textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (e.target.value) {
                setResumeFile(null);
                setFileName(null);
              }
              setValidationError(null);
            }}
            className="min-h-[70px] font-mono text-xs"
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-1">
          {resumeFile ? (
            <div className="flex items-center justify-between p-2 rounded-lg border bg-success/5 border-success/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-success" />
                <div>
                  <p className="text-[10px] font-medium">{fileName}</p>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Ready to analyze</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={removeFile}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop or click"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center justify-between">
          <span>Target Intelligence</span>
          <span className="text-violet-400">Optional URL Scraping</span>
        </label>
        <div className="flex gap-2">
           <Input 
             placeholder="Paste LinkedIn Job URL..." 
             className="flex-1 bg-white/5 border-white/10 text-xs h-10"
             value={scrapingUrl}
             onChange={(e) => setScrapingUrl(e.target.value)}
           />
           <Button 
             type="button"
             onClick={handleScrape}
             disabled={isScraping || !scrapingUrl.includes("linkedin.com")}
             className="bg-violet-600 hover:bg-violet-700 text-white h-10 px-4 text-[10px] font-black uppercase tracking-widest"
           >
             {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scrape"}
           </Button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Job Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setValidationError(null);
          }}
          className="min-h-[120px] text-sm bg-white/5 border-white/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Company (Optional)</label>
          <Input
            placeholder="e.g., Google"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-9 text-xs bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Job Title (Optional)</label>
          <Input
            placeholder="e.g., Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="h-9 text-xs bg-white/5 border-white/10"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-white/10 transition-all hover:scale-[1.01] active:scale-[0.99] mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Decoding JD Intelligence...
          </>
        ) : (
          <>
            Validate ATS Score
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No account needed. Completely free. Results in 10 seconds.
      </p>
    </form>
  );
}
