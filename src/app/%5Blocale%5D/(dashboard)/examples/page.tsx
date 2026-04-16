import { ExampleLibrary } from "@/components/examples/ExampleLibrary";

export const metadata = {
  title: "Resume Examples | VELSEAI",
  description: "Elite ATS-optimized resume examples for top tech firms.",
};

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-8">
      <ExampleLibrary />
    </div>
  );
}
