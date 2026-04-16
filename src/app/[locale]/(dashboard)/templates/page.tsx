import { TemplateGallery } from "@/components/templates/TemplateGallery";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-black text-white tracking-tighter">
          Pro Library
        </h1>
        <p className="text-zinc-500 font-medium max-w-2xl">
          A curated collection of <span className="text-violet-400 font-bold">ATS-Hacked blueprints</span>. 
          Engineered for bypass, optimized for human retention, and validated by ex-FAANG recruiters.
        </p>
      </div>

      <TemplateGallery />
    </div>
  );
}
