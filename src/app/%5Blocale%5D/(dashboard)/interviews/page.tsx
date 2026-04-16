import { InterviewCoach } from "@/components/interviews/InterviewCoach";

export const metadata = {
  title: "Interview Coach | VELSEAI",
  description: "Elite AI Interview Simulation Terminal.",
};

export default function InterviewPage() {
  return (
    <div className="container mx-auto py-8">
      <InterviewCoach />
    </div>
  );
}
