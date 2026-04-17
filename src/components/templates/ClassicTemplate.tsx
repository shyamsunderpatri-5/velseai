import { ExtractedResume } from "@/lib/resume-builder/schemas";

interface TemplateProps {
  data: ExtractedResume;
}

export function ClassicTemplate({ data }: TemplateProps) {
  return (
    <div 
      className="bg-white text-black p-10 mx-auto" 
      style={{
        width: "794px",
        height: "1123px",
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "12px",
        lineHeight: "1.5"
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase mb-2">{data.personal.name}</h1>
        <div className="text-sm border-b border-black pb-2 mb-2">
          {data.personal.city}, {data.personal.country} • {data.personal.email} • {data.personal.phone}
          {data.personal.linkedin && <span> • {data.personal.linkedin}</span>}
        </div>
        {(data.personal.nationality || data.personal.dateOfBirth || data.personal.visaStatus || data.personal.maritalStatus) && (
          <div className="text-xs text-black/80 flex justify-center gap-3">
            {data.personal.nationality && <span>Nationality: {data.personal.nationality}</span>}
            {data.personal.dateOfBirth && <span>DoB: {data.personal.dateOfBirth}</span>}
            {data.personal.visaStatus && <span>Visa: {data.personal.visaStatus}</span>}
            {data.personal.maritalStatus && <span>Status: {data.personal.maritalStatus}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Professional Summary</h2>
          <p className="text-sm text-justify">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-sm bg-black text-white px-1 inline-block">{exp.role}</h3>
                  <span className="text-xs font-semibold">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-semibold italic text-sm">{exp.company}</span>
                  <span className="text-xs italic">{exp.location}</span>
                </div>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  {[...(exp.responsibilities || []), ...(exp.achievements || [])].map((point, j) => (
                    <li key={j} className="text-justify">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((proj, i) => (
              <div key={i}>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="text-xs italic mb-1">Technologies: {proj.techStack.join(", ")}</div>
                )}
                <p className="text-sm mb-1 italic text-black/70">{proj.description}</p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  {proj.achievements?.map((point, j) => (
                    <li key={j} className="text-justify">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between items-baseline mb-2">
              <div>
                <span className="font-bold">{edu.institution}</span>
                <div>{edu.degree} in {edu.field}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold">{edu.startYear} - {edu.endYear}</span>
                {edu.grade && <div className="text-xs">Grade: {edu.grade}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certificates && data.certificates.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Certifications / Training</h2>
          <div className="space-y-1">
            {data.certificates.map((cert, i) => (
              <div key={i} className="flex justify-between items-baseline text-sm">
                <div>
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer && <span> — {cert.issuer}</span>}
                </div>
                <span className="text-xs font-semibold">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {(data.skills.technical.length > 0 || data.skills.tools.length > 0) && (
        <div>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Skills & Expertise</h2>
          <div className="text-sm">
            {data.skills.technical.length > 0 && (
              <div className="mb-1"><span className="font-bold">Technical:</span> {data.skills.technical.join(", ")}</div>
            )}
            {data.skills.tools.length > 0 && (
              <div><span className="font-bold">Tools:</span> {data.skills.tools.join(", ")}</div>
            )}
          </div>
        </div>
      )}
      {/* Location specific footers (India Declaration / UK References) */}
      {data.references && (
        <div className="mb-4 mt-6">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">References</h2>
          <p className="text-sm">{data.references}</p>
        </div>
      )}
      {data.declaration && (
        <div className="mb-4 mt-8">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Declaration</h2>
          <p className="text-sm text-justify">{data.declaration}</p>
          <div className="mt-8 flex justify-between text-sm">
            <div>Place: {data.personal.city}</div>
            <div>Signature: ______________________</div>
          </div>
        </div>
      )}
    </div>
  );
}
