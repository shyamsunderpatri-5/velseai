"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountryFormatId, COUNTRY_FORMATS } from "@/lib/resume-builder/country-formats";

interface CountrySelectorProps {
  selectedCountry: CountryFormatId | null;
  onSelect: (countryId: CountryFormatId) => void;
}

const formatFlags: Record<CountryFormatId, { flag: string; description: string }> = {
  usa_canada: { 
    flag: "🇺🇸 🇨🇦", 
    description: "Strict ATS compatibility. Emphasizes metrics and action verbs. No photos." 
  },
  uk_australia: { 
    flag: "🇬🇧 🇦🇺", 
    description: "Traditional CV format with personal statement. References included." 
  },
  germany_europe: { 
    flag: "🇩🇪 🇪🇺", 
    description: "Formal Lebenslauf style. Photos and biographical details required." 
  },
  india: { 
    flag: "🇮🇳", 
    description: "Detailed 2-3 page format. Includes career objectives and declarations." 
  },
  middle_east: { 
    flag: "🇦🇪 🇸🇦", 
    description: "Highly detailed. Includes nationality, visa status, and formal photo." 
  },
  international: { 
    flag: "🌍", 
    description: "Clean, universally accepted minimalist format. Standardized." 
  }
};

export function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
  const formats = Object.values(COUNTRY_FORMATS);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <Globe2 className="w-6 h-6 text-violet-500" />
          Target Market Format
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Different regions have strict rules for their resumes. We will automatically inject or remove data (like photos or dates of birth) to comply with local laws and recruiter expectations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formats.map((format) => {
          const isSelected = selectedCountry === format.id;
          const meta = formatFlags[format.id as CountryFormatId];

          return (
            <motion.div
              key={format.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(format.id as CountryFormatId)}
              className={cn(
                "relative cursor-pointer rounded-2xl p-5 border transition-all duration-300",
                isSelected
                  ? "bg-violet-600/10 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                  : "bg-[#0C0C0E] border-[#1F1F23] hover:border-violet-500/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-violet-500"
                  >
                    <CheckCircle2 className="w-5 h-5 fill-violet-500 text-black" />
                  </motion.div>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-3xl">{meta.flag}</div>
                <div>
                  <h3 className="font-bold text-white text-lg">{format.label}</h3>
                  <div className="text-xs font-mono text-violet-400 mt-1 uppercase tracking-wider">
                    {format.title} FORMAT
                  </div>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed min-h-[60px]">
                  {meta.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {format.rules.photo === "mandatory" && (
                  <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                    Photo Required
                  </span>
                )}
                {format.rules.photo === "forbidden" && (
                  <span className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    No Photo
                  </span>
                )}
                <span className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  {format.targetPages.join("-")} Page{format.targetPages[0] > 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
