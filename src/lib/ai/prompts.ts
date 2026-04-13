const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Brazilian Portuguese',
  ar: 'Arabic',
  fr: 'French',
  de: 'German',
  hi: 'Hindi'
};

export function getLanguageInstruction(locale: string): string {
  const lang = LANGUAGE_MAP[locale] || 'English';
  return `\n\nIMPORTANT: Respond entirely in ${lang}. Do not use any English unless technical terms (programming languages, tool names, company names) require it.`;
}

export function getBulletPointPrompt(params: {
  jobTitle: string;
  company: string;
  existingBullet?: string;
  keywords?: string[];
  industry: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an expert resume writer specializing in ATS-optimized resumes.${langInstruction}

Write 3 powerful bullet points for the following position:
- Job Title: ${params.jobTitle}
- Company: ${params.company}
- Industry: ${params.industry}
${params.existingBullet ? `- Current bullet: ${params.existingBullet}` : ''}
${params.keywords ? `- Important keywords to include: ${params.keywords.join(', ')}` : ''}

Requirements:
- Start with action verbs (Led, Built, Developed, Increased, Reduced, etc.)
- Use numbers/metrics where possible (%, $, X increase, etc.)
- Keep each bullet to 1-2 lines
- Focus on achievements, not just duties
- ATS-friendly: include relevant keywords naturally

Respond with just the 3 bullet points, one per line, no numbering.`;
}

export function getResumeSummaryPrompt(params: {
  name: string;
  experience: string[];
  skills: string[];
  targetRole?: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an expert resume writer.${langInstruction}

Write a professional summary (2-3 sentences) for:
- Name: ${params.name}
- Experience: ${params.experience.join(', ')}
- Skills: ${params.skills.join(', ')}
- Target Role: ${params.targetRole || 'General'}

Requirements:
- First person (I am, I have, I specialize)
- Highlight years of experience and key strengths
- End with what value you bring to employers
- Keep under 50 words
- ATS-friendly with relevant keywords`;
}

export function getCoverLetterPrompt(params: {
  name: string;
  targetCompany: string;
  targetRole: string;
  resumeHighlights: string[];
  jobDescription?: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are a professional cover letter writer.${langInstruction}

Write a compelling cover letter for:
- Your Name: ${params.name}
- Company: ${params.targetCompany}
- Position: ${params.targetRole}
- Key Highlights: ${params.resumeHighlights.join(', ')}
${params.jobDescription ? `- Job Description Focus: ${params.jobDescription}` : ''}

Requirements:
- Professional greeting (Dear Hiring Manager or similar)
- 3-4 paragraphs
- Show enthusiasm for the role and company
- Connect your experience to the job requirements
- Strong closing with call to action
- Keep it to one page
- ATS-friendly`;
}

export function getSkillSuggestionPrompt(params: {
  currentSkills: string[];
  jobTitle: string;
  industry: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an ATS and career expert.${langInstruction}

Suggest 10 relevant skills for:
- Current Skills: ${params.currentSkills.join(', ')}
- Job Title: ${params.jobTitle}
- Industry: ${params.industry}

Requirements:
- Mix of hard skills and soft skills
- Include both technical and domain-specific skills
- Prioritize skills that appear in job postings for this role
- Format as a simple comma-separated list
- Only return the skills, no explanation`;
}

export function getATSImprovementPrompt(params: {
  resumeText: string;
  jobDescription: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an ATS optimization expert.${langInstruction}

Analyze this resume against the job description and provide improvement suggestions.

Resume:
${params.resumeText}

Job Description:
${params.jobDescription}

Provide:
1. Missing keywords (at least 10)
2. Top 3 improvements to increase ATS score
3. Format issues to fix

Format as:
- MISSING KEYWORDS: [list]
- IMPROVEMENTS: [3 bullet points]
- FORMAT ISSUES: [any issues found]`;
}

export function getJobTailoringPrompt(params: {
  resumeText: string;
  jobDescription: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an expert resume writer specializing in job application tailoring.${langInstruction}

Tailor the resume to match the job description.

Resume:
${params.resumeText}

Job Description:
${params.jobDescription}

Provide:
1. A brief analysis of what matches and what doesn't
2. 5 specific changes to make to the resume
3. Keywords from the JD that should be added to the resume
4. Suggested bullet point rewrites

Format as:
- ANALYSIS: [2-3 sentences]
- CHANGES NEEDED: [5 bullet points]
- KEYWORDS TO ADD: [list]
- REWRITTEN BULLETS: [3 best bullets rewritten]`;
}

export function getInterviewQuestionsPrompt(params: {
  jobTitle: string;
  company: string;
  experience: string[];
  skills: string[];
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an interview preparation expert.${langInstruction}

Generate likely interview questions for this position.

- Job Title: ${params.jobTitle}
- Company: ${params.company}
- Experience: ${params.experience.join(', ')}
- Skills: ${params.skills.join(', ')}

Provide:
1. 10 likely technical/behavioral questions
2. For each, a strong 2-3 sentence answer outline

Format as a numbered list with questions and answer outlines.`;
}

export function getCareerAdvicePrompt(params: {
  currentRole: string;
  yearsExperience: number;
  skills: string[];
  targetGoal: string; // e.g., "tech lead", "remote work", "higher salary"
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are a career advisor.${langInstruction}

Provide career guidance for:
- Current Role: ${params.currentRole}
- Years of Experience: ${params.yearsExperience}
- Skills: ${params.skills.join(', ')}
- Goal: ${params.targetGoal}

Provide:
1. Recommended career path
2. Skills to develop next
3. Alternative roles to consider
4. Salary range expectation (market standard)
5. Action plan for next 6 months

Format as:
- CAREER PATH: [suggested progression]
- SKILLS TO DEVELOP: [list of skills]
- ALTERNATIVE ROLES: [list]
- SALARY RANGE: [approximate range]
- 6-MONTH ACTION PLAN: [numbered steps]`;
}

export function getRemoteWorkOptimizationPrompt(params: {
  resumeText: string;
  jobDescription: string;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You specialize in optimizing resumes for remote work opportunities.${langInstruction}

Analyze this resume for remote work applications.

Resume:
${params.resumeText}

Job Description:
${params.jobDescription}

Provide:
1. How to highlight remote-work readiness
2. Key phrases to add
3. Sections to emphasize
4. Red flags to remove

Format as:
- REMOTE READINESS: [1-2 sentences]
- KEY PHRASES TO ADD: [list]
- EMPHASIZE: [sections to highlight]
- RED FLAGS TO FIX: [issues to remove]`;
}