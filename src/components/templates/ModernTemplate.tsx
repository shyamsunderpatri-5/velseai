import { ExtractedResume } from "@/lib/resume-builder/schemas";

interface TemplateProps {
  data: ExtractedResume;
}

export function ModernTemplate({ data }: TemplateProps) {
  return (
    <div 
      className="bg-white text-zinc-800 mx-auto overflow-hidden relative flex flex-col" 
      style={{
        width: "794px",
        height: "1123px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        fontSize: "13px",
      }}
    >
      {/* Header - Colored (Using direct hex for html2canvas compatibility) */}
      <div className="px-10 py-8 flex justify-between items-center" style={{ backgroundColor: "#2563eb", color: "#ffffff" }}>
        <div>
          <div className="flex items-center gap-4 mb-1">
            {data.photoUrl && (
              <img src={data.photoUrl} alt="Profile" fetchPriority="high" crossOrigin="anonymous" className="w-16 h-16 rounded-full border-2 border-white/20 object-cover" />
            )}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-1">{data.personal.name}</h1>
              <p className="text-blue-100 font-medium text-sm tracking-wide uppercase">
                {data.experience?.[0]?.role || "Professional"}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right text-xs space-y-1 text-blue-100 font-medium text-sm">
          <div>{data.personal.city}, {data.personal.country}</div>
          <div>{data.personal.email}</div>
          <div>{data.personal.phone}</div>
          {data.personal.linkedin && <div>{data.personal.linkedin}</div>}
        </div>
      </div>
      
      {/* Location Metadata Bar */}
      {(data.personal.nationality || data.personal.dateOfBirth || data.personal.visaStatus || data.personal.maritalStatus) && (
        <div className="bg-blue-700 text-blue-100 px-10 py-1.5 text-[10px] uppercase tracking-widest flex gap-6">
          {data.personal.nationality && <span>Nationality: {data.personal.nationality}</span>}
          {data.personal.dateOfBirth && <span>DoB: {data.personal.dateOfBirth}</span>}
          {data.personal.visaStatus && <span>Visa: {data.personal.visaStatus}</span>}
          {data.personal.maritalStatus && <span>Status: {data.personal.maritalStatus}</span>}
        </div>
      )}

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-[35%] bg-zinc-50 p-8 border-r border-zinc-200 space-y-8">
          
          {data.skills.technical.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Technical Stack</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.technical.map((skill, i) => (
                  <span key={i} className="bg-zinc-200 text-zinc-700 px-2 py-1 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.skills.tools.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Tools</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.tools.map((tool, i) => (
                  <span key={i} className="border border-zinc-300 text-zinc-600 px-2 py-1 rounded text-xs font-medium">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Education</h2>
              <div className="space-y-4">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-zinc-800 text-sm">{edu.degree}</div>
                    <div className="text-xs text-zinc-600">{edu.field}</div>
                    <div className="text-xs text-zinc-500 italic mt-1">{edu.institution}</div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase mt-0.5">{edu.startYear} - {edu.endYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.certificates && data.certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Certifications</h2>
              <div className="space-y-4">
                {data.certificates.map((cert, i) => (
                  <div key={i}>
                    <div className="font-bold text-zinc-800 text-xs">{cert.name}</div>
                    <div className="text-[10px] text-zinc-500 italic mt-0.5">{cert.issuer}</div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase mt-0.5">{cert.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-[65%] p-8 space-y-8">
          
          {data.summary && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 border-b border-zinc-200 pb-2">Profile</h2>
              <p className="text-xs leading-relaxed text-zinc-600 text-justify">
                {data.summary}
              </p>
            </div>
          )}

          {data.experience && data.experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-zinc-200 pb-2">Experience</h2>
              <div className="space-y-6">
                {data.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-zinc-800 text-sm">{exp.role}</h3>
                        <div className="text-xs text-zinc-500 font-medium">{exp.company} • {exp.location}</div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <ul className="list-none mt-3 space-y-1.5">
                      {[...(exp.responsibilities || []), ...(exp.achievements || [])].map((point, j) => (
                        <li key={j} className="text-xs text-zinc-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-blue-300 before:rounded-full">
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
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-zinc-200 pb-2">Projects</h2>
              <div className="space-y-6">
                {data.projects.map((proj, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-zinc-800 text-sm">{proj.name}</h3>
                      <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">{proj.techStack?.join(" • ")}</div>
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-1 italic px-3">{proj.description}</div>
                    <ul className="list-none mt-2 space-y-1.5">
                      {proj.achievements?.map((point: string, j: number) => (
                        <li key={j} className="text-xs text-zinc-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-zinc-300 before:rounded-full">
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
            <div className="pt-4 mt-6 border-t border-zinc-200 space-y-6">
              {data.references && (
                <div>
                  <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">References</h2>
                  <p className="text-xs text-zinc-600">{data.references}</p>
                </div>
              )}
              {data.declaration && (
                <div>
                  <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Declaration</h2>
                  <p className="text-xs text-zinc-600 text-justify">{data.declaration}</p>
                  <p className="text-xs text-zinc-400 mt-4 italic">Signed: {data.personal.name} • {data.personal.city}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
