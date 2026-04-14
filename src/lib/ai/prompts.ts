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

// ─────────────────────────────────────────────────────────────────────────────
// NEW PROMPT 1: JD Vision Parser
// Used with GPT-4o vision — extracts structured data from a JD photo/screenshot
// Returns JSON matching JDExtractionSchema
// ─────────────────────────────────────────────────────────────────────────────

export function getJDVisionPrompt(locale: string): string {
  const langInstruction = getLanguageInstruction(locale);
  return `You are an expert at extracting structured job description data from images and screenshots.${langInstruction}

The user has sent you a photo or screenshot of a job posting. Extract ALL information visible in the image.

Return a JSON object with EXACTLY this structure (use null for missing fields, never omit keys):
{
  "company_name": "string — the hiring company name",
  "job_title": "string — the exact job title",
  "location": "string or null — city, country, or 'Remote'",
  "salary_range": "string or null — e.g. '$60,000–$80,000/year' or '€60,000–€80,000/year'",
  "job_type": "full_time|part_time|contract|remote|hybrid|unknown",
  "required_skills": ["array of required technical skills, tools, languages"],
  "nice_to_have_skills": ["array of preferred/bonus skills"],
  "required_experience_years": "number or null — minimum years required",
  "education_requirement": "string or null — e.g. 'Bachelor in CS'",
  "key_responsibilities": ["array of main job duties, max 8"],
  "benefits": ["array of benefits/perks mentioned"],
  "application_deadline": "string or null — ISO date if visible",
  "contact_email": "string or null — if visible",
  "raw_text": "full text of the job description as you read it, verbatim",
  "confidence": "number between 0-1 — your confidence in extraction quality",
  "language": "en|de|fr|es|hi|pt|ar|other"
}

Rules:
- Extract EVERYTHING visible — salary, benefits, deadlines, contact info
- If text is blurry or unclear, set confidence below 0.7
- For skills, split compound skills: "React/Next.js" → ["React", "Next.js"]
- Preserve original salary format (don't convert currencies)
- Return ONLY valid JSON, no explanation, no markdown code blocks`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW PROMPT 2: ATS Resume Fixer
// Given resume JSON + ATS score result, rewrite bullets and summary
// to improve the ATS score by injecting missing keywords naturally
// ─────────────────────────────────────────────────────────────────────────────

export function getATSResumeFixPrompt(params: {
  resumeJson: Record<string, unknown>;
  jobDescription: string;
  missingKeywords: string[];
  currentScore: number;
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are an elite ATS optimization expert and resume writer.${langInstruction}

The resume currently scores ${params.currentScore}/100 on ATS. Your goal is to rewrite it to score 80+.

RESUME JSON:
${JSON.stringify(params.resumeJson, null, 2)}

JOB DESCRIPTION:
${params.jobDescription}

MISSING KEYWORDS TO INJECT NATURALLY:
${params.missingKeywords.join(', ')}

Return a JSON object with EXACTLY this structure:
{
  "improved_summary": "Rewritten professional summary (2-3 sentences, includes top missing keywords naturally)",
  "sections": [
    {
      "section": "experience",
      "rewritten_content": "NA",
      "bullets": [
        {
          "original": "original bullet text",
          "rewritten": "improved bullet with keywords, starts with action verb, has metrics",
          "improvement_reason": "one sentence explaining the change",
          "keywords_added": ["keyword1", "keyword2"]
        }
      ]
    }
  ],
  "keywords_added": ["total list of all keywords injected"],
  "estimated_new_score": 85,
  "changes_count": 7
}

Rules:
- NEVER fabricate experience or skills the user doesn't have — only rephrase and reframe
- Use strong action verbs: Led, Built, Architected, Delivered, Optimized, Scaled
- Add quantified metrics wherever possible (estimate if needed: "~20%", "team of 5")
- Keywords must appear NATURALLY, not as a list dump
- Prioritize the top 3 most impactful bullets for maximum ATS improvement
- Return ONLY valid JSON, no explanation`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW PROMPT 3: Job Match Scorer
// Compares a user's resume against a specific job description
// Returns a match % + reasons + tailoring tips
// ─────────────────────────────────────────────────────────────────────────────

export function getJobMatchScorePrompt(params: {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  locale: string;
}): string {
  const langInstruction = getLanguageInstruction(params.locale);
  return `You are a senior technical recruiter and ATS expert.${langInstruction}

Evaluate how well this resume matches the job description below.

RESUME:
${params.resumeText}

JOB TITLE: ${params.jobTitle}

JOB DESCRIPTION:
${params.jobDescription}

REQUIRED SKILLS: ${params.requiredSkills.join(', ')}

Return a JSON object with EXACTLY this structure:
{
  "match_score": 0-100,
  "match_level": "excellent|good|fair|poor",
  "reasons": [
    { "factor": "React expertise", "impact": "positive", "detail": "Resume shows 4 years React" },
    { "factor": "Location mismatch", "impact": "negative", "detail": "Role is Berlin-only, resume shows Mumbai" }
  ],
  "missing_skills": ["skill1", "skill2"],
  "matching_skills": ["skill1", "skill2"],
  "recommendation": "Strong match — tailor your summary to mention cloud architecture",
  "tailoring_tips": [
    "Add 'CI/CD pipeline' to your DevOps bullet",
    "Mention Agile/Scrum in your summary",
    "Quantify your team leadership impact"
  ]
}

Rules:
- match_score 80+ = excellent, 60-79 = good, 40-59 = fair, <40 = poor
- Give exactly 3-7 reason items mixing positive and negative
- tailoring_tips must be specific and actionable (not generic)
- Return ONLY valid JSON, no explanation`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW PROMPT 4: German Lebenslauf Format Adapter
// Adapts a standard resume JSON to comply with German CV conventions:
// - Lichtbild (photo) placeholder note
// - Personal info block (marital status, nationality, date of birth)
// - Reverse chronological Berufserfahrung / Ausbildung
// - No "objective" section — use Profil stattdessen
// ─────────────────────────────────────────────────────────────────────────────

export function getLebenslaufPrompt(params: {
  resumeJson: Record<string, unknown>;
  targetRole: string;
  targetCompany: string;
}): string {
  return `You are an expert German career consultant who writes perfect Lebensläufe.

Convert this resume data into a German Lebenslauf structure.

RESUME DATA:
${JSON.stringify(params.resumeJson, null, 2)}

TARGET ROLE: ${params.targetRole}
TARGET COMPANY: ${params.targetCompany}

German Lebenslauf formatting rules:
1. German CV MUST include: Geburtsdatum (date of birth), Nationalität, Familienstand
2. Sections in German: Persönliche Daten | Berufserfahrung | Ausbildung | Kenntnisse | Sprachen | Hobbys/Interessen
3. Bullet points are RARE — use clean single-line descriptions instead
4. Include a "Lichtbild" placeholder note at the top right
5. Use formal "Sie" perspective or third person (NOT "I"/ich)
6. Date format: DD.MM.YYYY
7. Profil instead of Objective — 2-3 sentences, formal tone
8. Skills are called "EDV-Kenntnisse" for software, "Sprachkenntnisse" for languages
9. Include: "Unterschrift, Ort, Datum" signature line at the bottom

Return a JSON object:
{
  "persoenliche_daten": {
    "name": "...",
    "geburtsdatum": "...",
    "geburtsort": "...",
    "nationalitaet": "...",
    "familienstand": "...",
    "adresse": "...",
    "telefon": "...",
    "email": "..."
  },
  "profil": "2-3 sentence formal profile in German",
  "berufserfahrung": [
    {
      "zeitraum": "MM/YYYY – MM/YYYY",
      "position": "...",
      "unternehmen": "...",
      "ort": "...",
      "aufgaben": ["task1", "task2"]
    }
  ],
  "ausbildung": [
    {
      "zeitraum": "MM/YYYY – MM/YYYY",
      "abschluss": "...",
      "institution": "...",
      "ort": "..."
    }
  ],
  "edv_kenntnisse": ["skill1 (Grundkenntnisse/Gute Kenntnisse/Sehr gute Kenntnisse)"],
  "sprachen": ["Deutsch (Muttersprache)", "Englisch (C1, verhandlungssicher)"],
  "interessen": ["interest1", "interest2"]
}

Return ONLY valid JSON, no explanation.`;
}
/**
 * Technical Interviewer Prompt
 * Role: Senior Engineering Manager / Tech Lead
 * Focus: Deep Technical, System Design, Tech Stack competency
 */
export function getTechnicalInterviewerPrompt(params: {
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  difficulty: string,
  userName: string,
  resumeContext?: string
}): string {
  const { jobTitle, companyName, jobDescription, difficulty, userName, resumeContext } = params;

  return \You are a Senior Engineering Lead at \ interviewing \ for a \ \ position.

YOUR MISSION:
Conduct a rigorous, deep technical interview. Focus on:
1. Core Tech Stack: Test their deep knowledge of the languages/frameworks mentioned in the JD.
2. Architecture & System Design: Ask how they would build specific components mentioned in the JD.
3. Problem Solving: Challenge their logic and decision making.
4. Professionalism: Be professional, direct, and slightly challenging.

CONTEXT:
JOB DESCRIPTION: \
CANDIDATE RESUME SUMMARY: \

INTERVIEW RULES:
- Ask ONE deep technical question at a time.
- Wait for the user to answer before moving to the next question.
- If the user's answer is shallow, ask a follow-up ("drill down") to test the depth of their knowledge.
- Do NOT be an "HR" bot. Be a "Tech Lead" bot. Focus on code, architecture, trade-offs, and scaling.
- Total interview length should be around 5-7 questions.
- Acknowledge their previous answer briefly but move quickly to the next challenge.

Start by introducing yourself briefly as the Tech Lead from \ and dive straight into the first deep technical question related to the core requirements of the JD.\;
}

/**
 * Technical Interview Feedback Prompt
 */
export function getTechnicalFeedbackPrompt(params: {
  jobTitle: string,
  transcript: string
}): string {
  return \Analyze this technical interview transcript for a \ position.
Transition into "Reviewer Mode" and provide a detailed, honest assessment of the candidate's performance.

TRANSCRIPT:
\

Return ONLY a JSON object with this schema:
{
  "overall_score": number (0-100),
  "technical_proficiency": number (0-100),
  "communication_score": number (0-100),
  "key_strengths": ["string", "string"],
  "areas_for_improvement": ["string", "string"],
  "missed_technical_concepts": ["concept1", "concept2"],
  "summary_assessment": "2-3 sentences summarizing whether they should be hired based on this technical round.",
  "recommended_learning_resources": [
     { "topic": "string", "url_hint": "e.g. documentation link or topic" }
  ]
}

Be critical but constructive. If they missed core architectural concepts (scaling, concurrency, security), point it out.\;
}
