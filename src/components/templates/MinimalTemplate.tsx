import { ExtractedResume } from "@/lib/resume-builder/schemas";

interface TemplateProps {
  data: ExtractedResume;
}

export function MinimalTemplate({ data }: TemplateProps) {
  return (
    <div 
      className="bg-white text-zinc-900 mx-auto p-12 overflow-hidden" 
      style={{
        width: "794px",
        height: "1123px",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "13px",
      }}
    >
      {/* Header */}
      <div className="mb-10 flex justify-between items-end border-b pb-4 border-zinc-200">
        <div className="flex gap-6 items-center">
          {data.photoUrl && (
            <img src={data.photoUrl} alt="Photo" crossOrigin="anonymous" fetchPriority="high" className="w-20 h-20 rounded-full border border-zinc-200 object-cover" />
          )}
          <div>
            <h1 className="text-[42px] font-light tracking-tighter leading-none mb-2">{data.personal.name}</h1>
            <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">
              {data.personal.city}, {data.personal.country}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-zinc-500 space-y-1 font-medium">
          <div>{data.personal.email}</div>
          <div>{data.personal.phone}</div>
          {data.personal.linkedin && <div>{data.personal.linkedin}</div>}
        </div>
      </div>

      {/* Location Metadata Bar */}
      {(data.personal.nationality || data.personal.dateOfBirth || data.personal.visaStatus || data.personal.maritalStatus) && (
        <div className="text-zinc-400 text-[10px] uppercase tracking-widest flex gap-8 mb-8 border-b border-zinc-100 pb-4">
          {data.personal.nationality && <span>Nationality: {data.personal.nationality}</span>}
          {data.personal.dateOfBirth && <span>DoB: {data.personal.dateOfBirth}</span>}
          {data.personal.visaStatus && <span>Visa: {data.personal.visaStatus}</span>}
          {data.personal.maritalStatus && <span>Status: {data.personal.maritalStatus}</span>}
        </div>
      )}

      <div className="grid grid-cols-[1fr_3.5fr] gap-10">
        
        {/* Left Column (Metadata) */}
        <div className="space-y-10">
          
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Education</h2>
              <div className="space-y-4">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div className="font-semibold text-sm">{edu.degree}</div>
                    <div className="text-xs text-zinc-500 mt-1">{edu.institution}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{edu.startYear} - {edu.endYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills.technical.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Skills</h2>
              <ul className="space-y-1.5 list-none">
                {data.skills.technical.map((skill, i) => (
                  <li key={i} className="text-xs font-medium text-zinc-700">{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {data.certificates && data.certificates.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Certifications</h2>
              <div className="space-y-4">
                {data.certificates.map((cert, i) => (
                  <div key={i}>
                    <div className="font-semibold text-xs">{cert.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{cert.issuer}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{cert.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Content) */}
        <div className="space-y-10">
          
          {data.summary && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Profile</h2>
              <p className="text-[13px] leading-relaxed text-zinc-600 font-light text-justify">
                {data.summary}
              </p>
            </div>
          )}

          {data.experience && data.experience.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Experience</h2>
              <div className="space-y-8">
                {data.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-semibold text-base">{exp.role}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-500 mb-3">{exp.company}</div>
                    <ul className="space-y-2">
                      {[...(exp.responsibilities || []), ...(exp.achievements || [])].map((point, j) => (
                        <li key={j} className="text-[13px] leading-relaxed text-zinc-600 font-light relative pl-4 before:content-['—'] before:absolute before:left-0 before:text-zinc-300">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Projects</h2>
              <div className="space-y-8">
                {data.projects.map((proj, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-semibold text-base">{proj.name}</h3>
                    </div>
                    <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-2">{proj.techStack?.join(" • ")}</div>
                    <div className="text-xs text-zinc-500 italic mb-3 pr-4">{proj.description}</div>
                    <ul className="space-y-2">
                      {proj.achievements?.map((point: string, j: number) => (
                        <li key={j} className="text-[13px] leading-relaxed text-zinc-600 font-light relative pl-4 before:content-['—'] before:absolute before:left-0 before:text-zinc-300">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References & Declarations */}
          {(data.references || data.declaration) && (
            <div className="pt-8 space-y-8">
              {data.references && (
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">References</h2>
                  <p className="text-[13px] text-zinc-600 font-light">{data.references}</p>
                </div>
              )}
              {data.declaration && (
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Declaration</h2>
                  <p className="text-[13px] text-zinc-600 font-light text-justify">{data.declaration}</p>
                  <p className="text-xs text-zinc-400 mt-6 pt-4 border-t border-zinc-100">Signature: {data.personal.name} • {data.personal.city}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
