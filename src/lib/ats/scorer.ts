const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "about", "as", "into", "through", "during", "before", "after", "above",
  "below", "up", "down", "out", "off", "over", "under", "again", "further",
  "then", "once", "here", "there", "when", "where", "why", "how", "all",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "s", "t",
  "just", "don", "now", "and", "but", "or", "because", "until", "while",
  "if", "this", "that", "these", "those", "am", "it", "its", "which",
  "who", "whom", "their", "they", "them", "your", "you", "yourself",
  "yours", "our", "we", "us", "him", "his", "she", "her", "hers",
]);

export interface ATSResult {
  overall_score: number;
  keyword_score: number;
  format_score: number;
  skills_score: number;
  experience_score: number;
  impact_score: number;
  readability_analysis: string;
  matched_keywords: string[];
  missing_keywords: string[];
  hard_skills_matched: string[];
  hard_skills_missing: string[];
  soft_skills_matched: string[];
  ats_issues: string[];
  suggestions: {
    high_priority: string[];
    medium_priority: string[];
    low_priority: string[];
  };
  experience_years_found: number | null;
  experience_years_required: number | null;
  keyword_density: number;
  readability_score: number;
}

export function scoreResume(
  resumeText: string,
  jobDescription: string
): ATSResult {
  const normalizedResume = resumeText.toLowerCase();
  const normalizedJD = jobDescription.toLowerCase();

  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);

  const matchedHardSkills = jdKeywords.hardSkills.filter((skill) =>
    normalizedResume.includes(skill.toLowerCase())
  );
  const missingHardSkills = jdKeywords.hardSkills.filter(
    (skill) => !normalizedResume.includes(skill.toLowerCase())
  );

  const matchedSoftSkills = jdKeywords.softSkills.filter((skill) =>
    normalizedResume.includes(skill.toLowerCase())
  );

  const matchedIndustryTerms = jdKeywords.industryTerms.filter((term) =>
    normalizedResume.includes(term.toLowerCase())
  );
  const missingIndustryTerms = jdKeywords.industryTerms.filter(
    (term) => !normalizedResume.includes(term.toLowerCase())
  );

  const allMatchedKeywords = [
    ...matchedHardSkills,
    ...matchedSoftSkills,
    ...matchedIndustryTerms,
  ];

  const allMissingKeywords = [
    ...missingHardSkills,
    ...missingIndustryTerms,
  ];

  const experienceYearsFound = extractYearsOfExperience(resumeText);
  const experienceYearsRequired = extractYearsRequired(jobDescription);
  
  const keywordScore = calculateKeywordScore(
    allMatchedKeywords,
    jdKeywords.hardSkills,
    jdKeywords.softSkills,
    jdKeywords.industryTerms
  );

  const formatScore = calculateFormatScore(resumeText, normalizedResume);
  const skillsScore = calculateSkillsScore(
    matchedHardSkills,
    jdKeywords.hardSkills,
    matchedSoftSkills,
    jdKeywords.softSkills
  );
  const experienceScore = calculateExperienceScore(experienceYearsFound, experienceYearsRequired);
  const impactScore = calculateImpactScore(resumeText);
  const readabilityScore = calculateReadabilityScore(resumeText);

  // Elite Weighted Score: Optimized to reward high-quality tailoring
  const overallScore = Math.round(
    keywordScore * 0.40 +        // Keywords/Tailoring is now the primary driver
    formatScore * 0.20 + 
    skillsScore * 0.20 +         // Skills match is rewarded more
    experienceScore * 0.10 +     // Seniority is critical but less weighted in total score
    impactScore * 0.10           // Impact metrics carry weight for elite 90+ scores
  );

  const keywordDensity = calculateKeywordDensity(resumeText, allMatchedKeywords);
  const issues = detectATSIssues(resumeText, keywordDensity, experienceYearsFound, experienceYearsRequired, impactScore);
  
  const suggestions = generateSuggestions(
    allMissingKeywords,
    issues,
    formatScore,
    keywordScore,
    skillsScore,
    experienceScore,
    impactScore
  );

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    keyword_score: keywordScore,
    format_score: formatScore,
    skills_score: skillsScore,
    experience_score: experienceScore,
    impact_score: impactScore,
    readability_analysis: getReadabilityAnalysis(readabilityScore),
    matched_keywords: [...new Set(allMatchedKeywords)].slice(0, 30),
    missing_keywords: [...new Set(allMissingKeywords)].slice(0, 20),
    hard_skills_matched: [...new Set(matchedHardSkills)],
    hard_skills_missing: [...new Set(missingHardSkills)],
    soft_skills_matched: [...new Set(matchedSoftSkills)],
    ats_issues: issues,
    suggestions,
    experience_years_found: experienceYearsFound,
    experience_years_required: experienceYearsRequired,
    keyword_density: calculateKeywordDensity(resumeText, allMatchedKeywords),
    readability_score: readabilityScore,
  };
}

function getReadabilityAnalysis(score: number): string {
  if (score >= 90) return "Very Easy to Read (11yr old)";
  if (score >= 80) return "Easy (12yr old)";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard Professional";
  if (score >= 50) return "Fairly Difficult (High School)";
  if (score >= 30) return "Difficult (College Level)";
  return "Very Difficult (Post-Grad)";
}

function extractKeywords(text: string) {
  const normalizedText = text.toLowerCase();
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const matchSet = (library: string[]) => {
    return library.filter((item) => {
      const regex = new RegExp(`\\b${escapeRegExp(item.toLowerCase())}\\b`, "i");
      return regex.test(normalizedText);
    });
  };

  return {
    hardSkills: matchSet(HARD_SKILLS),
    softSkills: matchSet(SOFT_SKILLS),
    industryTerms: matchSet(INDUSTRY_KEYWORDS),
  };
}

function calculateKeywordScore(
  matched: string[],
  totalHard: string[],
  totalSoft: string[],
  totalIndustry: string[]
): number {
  if (totalHard.length + totalSoft.length + totalIndustry.length === 0) return 50;

  let score = 0;
  const hardWeight = 3;
  const industryWeight = 2;
  const softWeight = 1;

  matched.forEach((m) => {
    if (totalHard.includes(m)) score += hardWeight;
    else if (totalIndustry.includes(m)) score += industryWeight;
    else if (totalSoft.includes(m)) score += softWeight;
  });

  const maxScore =
    totalHard.length * hardWeight +
    totalSoft.length * softWeight +
    totalIndustry.length * industryWeight;

  return Math.min(100, Math.round((score / maxScore) * 100));
}

function calculateFormatScore(resumeText: string, normalized: string): number {
  let score = 100;

  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/);
  const hasLinkedIn = normalized.includes("linkedin");
  const hasLocation = /[A-Z][a-z]+,\s*[A-Z]{2}/.test(resumeText) || /\d{6}/.test(resumeText);

  if (!emailMatch) score -= 10;
  if (!phoneMatch) score -= 10;
  if (!hasLinkedIn) score -= 5;
  if (!hasLocation) score -= 5;

  const hasExperience = /experience|work history|employment/i.test(resumeText);
  const hasEducation = /education|academic|degree|university|college/i.test(resumeText);
  const hasSkills = /skills|technologies|competencies/i.test(resumeText);
  const hasSummary = /summary|objective|profile|about/i.test(resumeText);

  if (!hasExperience) score -= 15;
  if (!hasEducation) score -= 10;
  if (!hasSkills) score -= 10;
  if (!hasSummary) score -= 5;

  const hasTables = /<table|<tr|<td/i.test(resumeText);
  const hasHeaders = /<header|<h[1-3]/i.test(resumeText);
  const hasImages = /<img|<image|\.png|\.jpg|\.jpeg|\.gif/i.test(resumeText);
  const hasColumns = /columns?|multi-?column/i.test(resumeText);

  if (hasTables) score -= 20;
  if (hasHeaders) score -= 15;
  if (hasImages) score -= 10;
  if (hasColumns) score -= 10;

  const wordCount = resumeText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 300) score -= 20;
  else if (wordCount < 500) score -= 5;
  else if (wordCount <= 900) score += 10;
  else score -= 5;

  const hasActionVerbs = /^(led|managed|developed|created|implemented|increased|decreased|improved|achieved|reduced|launched|designed|built|delivered|organized|coordinated|analyzed|optimized|streamlined)/im.test(resumeText);
  if (hasActionVerbs) score += 10;

  const hasQuantified = /\d+%|\d+x|\$[\d,]+|\d+[\d,]*\s*(users?|customers?|employees?|projects?|clients?)/i.test(resumeText);
  if (hasQuantified) score += 15;

  return Math.min(100, Math.max(0, score));
}

function calculateSkillsScore(
  matchedHard: string[],
  totalHard: string[],
  matchedSoft: string[],
  totalSoft: string[]
): number {
  if (totalHard.length === 0 && totalSoft.length === 0) return 50;

  const hardScore = totalHard.length > 0 ? (matchedHard.length / totalHard.length) * 100 : 0;
  const softScore = totalSoft.length > 0 ? (matchedSoft.length / totalSoft.length) * 100 : 0;

  return Math.round((hardScore * 0.7 + softScore * 0.3));
}

function calculateExperienceScore(yearsFound: number | null, yearsRequired: number | null): number {
  if (yearsRequired === null) return 90; // Higher baseline if JD doesn't specify requirements
  if (yearsFound === null) return 75; // Forgiving baseline if years aren't explicitly stated but resume is structuraly sound

  // Exact or Close Match (Perfect Seniority)
  if (yearsFound >= yearsRequired && yearsFound <= yearsRequired + 3) {
    return 100;
  }

  // THE SENIORITY WALL (Gating logic)
  // If a role is Junior (1-3 yrs) and candidate is Senior (8+ yrs), it is a MISMATCH.
  if (yearsRequired <= 3 && yearsFound >= 8) {
    return 60; // Flag as Risk: Overqualified
  }

  // Senior for Mid role
  if (yearsRequired <= 5 && yearsFound >= 12) {
    return 65;
  }

  // Over-qualified Match (Seniority Fit Penalty)
  if (yearsFound > yearsRequired + 3) {
    const diff = yearsFound - yearsRequired;
    if (diff > 7) return 75; // Significantly overqualified
    return 85; // Slightly overqualified
  }

  // Under-qualified Match
  const ratio = yearsFound / yearsRequired;
  return Math.round(ratio * 100);
}

function calculateImpactScore(text: string): number {
  let score = 0;
  
  // KPI detection ($, %, metrics, numbers)
  const metricsCount = (text.match(/\d+(%|x|k|m|b|\s?users?|\s?customers?|\s?revenue)/gi) || []).length;
  const growthTerms = (text.match(/\b(increased|decreased|improved|optimized|automated|grew|scaled|reduced|saved|achieved)\b/gi) || []).length;
  const currencyMatch = (text.match(/[\$£€¥]\d+/g) || []).length;

  score += Math.min(metricsCount * 15, 45); // Up to 45 pts for metrics
  score += Math.min(growthTerms * 10, 40);  // Up to 40 pts for growth verbs
  score += Math.min(currencyMatch * 15, 15); // Up to 15 pts for financial impact

  return Math.min(100, score);
}

function extractYearsOfExperience(text: string): number | null {
  const patterns = [
    /(\d+)\s*\+\s*(?:yrs?|years?)/i,                // Matches "9 + yrs", "9+years"
    /(\d+)\+?\s*(?:yrs?|years?)\s*(?:of\s*)?exp/i,  // Matches "9+ yrs", "9 years of exp"
    /(?:over\s*)?(\d+)\+?\s*(?:yrs?|years?)\s*(?:of\s*)?exp/i,
    /experience[:\s]+(\d+)\+?\s*(?:yrs?|years?)/i,
    /(\d+\.?\d*)\s*(?:yrs?|years?)/i,               // Matches "9.5 years"
    /(\d+)\s*years\s*of\s*professional\s*experience/i,
    /total\s*experience[:\s]*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Math.min(parseFloat(match[1]), 30);
  }

  const dateRanges = text.match(/\d{4}\s*[-–]\s*(?:\d{4}|present|current)/gi) || [];
  if (dateRanges.length > 0) {
    let totalYears = 0;
    const currentYear = new Date().getFullYear();

    dateRanges.forEach((range) => {
      const years = range.match(/\d{4}/g) || [];
      if (years.length >= 2 && years[0] && years[1]) {
        const start = parseInt(years[0], 10);
        const endYear = years[1].toLowerCase() === "present" || years[1].toLowerCase() === "current"
          ? currentYear
          : parseInt(years[1], 10);
        totalYears += endYear - start;
      }
    });

    return totalYears > 0 ? Math.min(totalYears, 30) : null;
  }

  return null;
}

function extractYearsRequired(text: string): number | null {
  const patterns = [
    // Range detection: "1 to 2 years", "3-5 years"
    /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:yrs?|years?)\s*(?:(?:of\s*)?(?:exp|experience))?/i,
    /(\d+)\+?\s*(?:yrs?|years?)\s*(?:of\s*)?experience/i,
    /minimum\s*(?:of\s*)?(?:\d+)?\s*(\d+)\+?\s*(?:yrs?|years?)/i,
    /at\s*least\s*(\d+)\s*(?:yrs?|years?)/i,
    /req(?:uire)?\s*(\d+)\s*(?:yrs?|years?)/i,         // Matches "req 2 years"
    /(\d+)\s*(?:yrs?|years?)\s*exp/i,                  // Matches "2 years exp"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // If it's a range, take the bottom of the range as the requirement
      return parseInt(match[1], 10);
    }
  }

  return null;
}

const BUZZWORDS = [
  "team player", "hard worker", "self-starter", "fast learner", "people person", 
  "dedicated", "dependable", "passionate", "dynamic", "ambitious",
  "results-oriented", "results-driven", "strategic thinker", "innovative", 
  "adding value", "go-getter", "thought leader", "synergize", "creative problem solver"
];

const WEAK_VERBS = [
  "helped", "assisted", "handled", "worked on", "responsible for", "participated", "involved with"
];

const STANDARD_HEADERS = [
  "work experience", "professional experience", "employment history", "experience",
  "education", "academic background", "academic history",
  "skills", "technical skills", "technologies", "core competencies",
  "projects", "personal projects", "portfolio",
  "summary", "professional summary", "profile", "about me", "objective"
];

function detectATSIssues(
  text: string, 
  keywordDensity: number, 
  yearsFound: number | null, 
  yearsRequired: number | null,
  impactScore: number
): string[] {
  const issues: string[] = [];
  const normalized = text.toLowerCase();

  // Keyword Stuffing Detection
  if (keywordDensity > 12) {
    issues.push("Keyword density is too high (>12%) - may be flagged as spam by modern ATS");
  }

  // Buzzword/Fluff Detection
  const foundBuzzwords = BUZZWORDS.filter(word => normalized.includes(word));
  if (foundBuzzwords.length > 3) {
    issues.push(`Too many buzzwords detected (${foundBuzzwords.slice(0, 3).join(", ")}) - replace with quantifiable results`);
  }

  // Weak Verb Detection
  const foundWeakVerbs = WEAK_VERBS.filter(verb => normalized.includes(verb));
  if (foundWeakVerbs.length > 2) {
    issues.push("Passive / Weak verbs detected - replace with active power verbs (e.g., 'Orchestrated', 'Optimized')");
  }

  // Section Header Validation
  const hasStandardHeaders = STANDARD_HEADERS.some(header => normalized.includes(header));
  if (!hasStandardHeaders) {
    issues.push("Non-standard section headers detected - use standard titles like 'Work Experience' for reliable parsing");
  }

  // The One-Page Rule (US/Canada Standard)
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount > 1000) {
    issues.push("Extreme Page Length detected (likely 3+ pages) - US/Canada recruiters strongly prefer 1-2 pages");
  } else if (wordCount > 750) {
    issues.push("Resume length is borderline - aim for a concise 2-page limit");
  }

  // Seniority Fit Check
  if (yearsFound !== null && yearsRequired !== null) {
    if (yearsFound > yearsRequired + 5) {
      issues.push("Potential Over-qualification detected for this seniority level");
    }
  }

  // Impact/KPI Check
  if (impactScore < 30) {
    issues.push("Low impact metrics - try to quantify your achievements with numbers and percentages");
  }

  if (/<table|<tr|<td/i.test(text)) {
    issues.push("Tables detected - ATS may not parse table data correctly");
  }
  if (/<header|<h[1-3]/i.test(text)) {
    issues.push("Headers/footers detected - may not be parsed by ATS");
  }
  if (/<img|<image/i.test(text)) {
    issues.push("Images detected - ATS cannot read images");
  }
  if (/[\u{1F600}-\u{1F6FF}]/u.test(text)) {
    issues.push("Emojis detected - some ATS systems struggle with special characters");
  }
  if (wordCount < 300) {
    issues.push("Resume is too short - aim for at least 500 words");
  }
  if (wordCount > 1200) {
    issues.push("Resume is exceptionally long - this is a high risk for North American recruiter rejection");
  }

  const inconsistentDates = text.match(/\d{1,2}\/\d{4}/g);
  const standardDates = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/gi);
  if (inconsistentDates && standardDates && inconsistentDates.length > 0 && standardDates.length > 0) {
    issues.push("Inconsistent date formats detected");
  }

  return issues;
}

function generateSuggestions(
  missingKeywords: string[],
  issues: string[],
  formatScore: number,
  keywordScore: number,
  skillsScore: number,
  experienceScore: number,
  impactScore: number
): { high_priority: string[]; medium_priority: string[]; low_priority: string[] } {
  const highPriority: string[] = [];
  const mediumPriority: string[] = [];
  const lowPriority: string[] = [];

  if (missingKeywords.length > 0 && missingKeywords.length <= 5) {
    highPriority.push(
      `Add these missing keywords: ${missingKeywords.slice(0, 5).join(", ")}`
    );
  } else if (missingKeywords.length > 5) {
    highPriority.push(
      `Add at least 5 of these keywords: ${missingKeywords.slice(0, 8).join(", ")}`
    );
  }

  if (impactScore < 40) {
    highPriority.push("Quantify achievements: Use the formula [Action Verb] + [Context] + [Metric].");
  }

  issues.forEach((issue) => {
    if (issue.includes("Weak verbs")) {
      highPriority.push("Replace weak verbs (Helped, Assisted) with Power Verbs (Architected, Scaled, Spearheaded).");
    }
    if (issue.includes("Non-standard section headers")) {
      mediumPriority.push("Use standard headers: 'Work Experience', 'Skills', and 'Education'.");
    }
    if (issue.includes("buzzwords")) {
      mediumPriority.push("Remove personality fluff (Team player, Dedicated) and replace with evidence-based bullet points.");
    }
    if (issue.includes("Over-qualification")) {
      lowPriority.push("Emphasize leadership or mentorship if applying for roles below your current seniority.");
    }
  });

  if (formatScore < 60) {
    highPriority.push("Fix ATS formatting: Remove tables, columns, and images to ensure 100% parse rate.");
  }

  mediumPriority.push("Use strong action verbs (Led, Managed, Engineered, Scaled)");
  lowPriority.push("Ensure consistent date formats throughout (e.g., Jan 2024)");

  return {
    high_priority: highPriority.slice(0, 3),
    medium_priority: mediumPriority.slice(0, 5),
    low_priority: lowPriority.slice(0, 3),
  };
}

function calculateKeywordDensity(text: string, matchedKeywords: string[]): number {
  const words = text.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (words.length === 0) return 0;

  const matchedCount = matchedKeywords.reduce((count, kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  return Math.round((matchedCount / words.length) * 100);
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

const HARD_SKILLS = [
  // TECH (Legacy + Modern)
  "react", "vue", "angular", "node.js", "nodejs", "python", "java", "c++", "c#",
  "javascript", "typescript", "html", "css", "sql", "mysql", "postgresql", "mongodb",
  "redis", "elasticsearch", "docker", "kubernetes", "aws", "azure", "gcp", "google cloud",
  "git", "github", "gitlab", "ci/cd", "devops", "agile", "scrum", "jira",
  "rest api", "graphql", "grpc", "microservices", "linux", "unix", "windows server",
  "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "machine learning",
  "deep learning", "nlp", "computer vision", "data science", "data analysis", "data engineering",
  "tableau", "power bi", "excel", "powerpoint", "figma", "sketch", "adobe xd", "photoshop",
  "illustrator", "ui/ux", "responsive design", "mobile development", "ios", "android",
  "swift", "kotlin", "flutter", "react native", "sass", "less", "webpack", "vite",
  "rust", "go", "golang", "php", "laravel", "ruby", "rails", "django", "flask",
  "spring", ".net", "asp.net", "express", "next.js", "nuxt", "gatsby", "graphql",
  "prisma", "sequelize", "typeorm", "nginx", "apache", "tomcat", "jenkins", "circleci",
  "github actions", "bitbucket", "jira", "confluence",
  
  // SALES (Elite 2026)
  "Salesforce", "HubSpot", "CRM Management", "Pipeline Management", "Forecast Accuracy",
  "Consultative Selling", "B2B Sales", "SaaS Sales", "Enterprise Sales", "MEDDIC",
  "Challenger Sale", "Lead Generation", "Sales Enablement", "Quota Attainment",
  "Business Development", "Account Management", "Strategic Partnerships",
  "Negotiation", "Objection Handling", "Closing", "Cold Calling", "Social Selling",
  
  // MARKETING (Elite 2026)
  "Go-To-Market", "GTM Strategy", "Marketing Automation", "GA4", "Google Analytics",
  "GTM", "Google Tag Manager", "SEO", "Search Engine Optimization", "PPC", "Google Ads",
  "Performance Marketing", "Content Strategy", "Email Marketing", "CRO", "Conversion Rate Optimization",
  "Brand Positioning", "Campaign Management", "Attribution Modeling", "A/B Testing",
  "Customer Lifecycle", "Lead Nurturing", "Social Media Marketing", "Influencer Marketing",
  
  // FINANCE & OPS (Elite 2026)
  "Financial Analysis", "P&L Management", "Profit and Loss", "Forecasting", "Budgeting",
  "GAAP", "SOX Compliance", "FP&A", "Financial Planning & Analysis", "Cash Flow",
  "Financial Modeling", "Valuation", "Auditing", "Internal Audit", "Corporate Finance",
  "Risk Management", "Capital Budgeting", "M&A", "Mergers and Acquisitions",
  "Revenue Operations", "RevOps", "Unit Economics", "LTV/CAC", "ARR", "MRR",
  
  // GENERAL CORPORATE / MANAGEMENT
  "Project Management", "Product Management", "Stakeholder Management", "Operations",
  "Supply Chain", "Procurement", "Vendor Management", "Compliance", "Regulatory",
  "Strategic Planning", "Change Management", "Business Insights", "ROI Analysis",
  "Process Improvement", "Lean Six Sigma", "Operational Excellence",

  // SENIORITY & ARCHITECTURE
  "HLD", "LLD", "System Design", "Docker Support", "Containerization", "Orchestration",
  "Terraform", "Ansible", "IaC", "CI/CD Pipelines", "Refactoring", "Code Reviews",
  "Mentoring", "System Architecture", "Micro-services", "Event-driven", "Serverless",
  "CQRS", "DDD", "TDD", "Unit Testing", "Integration Testing", "Clean Code", "SOLID",
  "Technical Debt", "Legacy Migration", "High Availability", "Scalability", "Bottlenecks",
];

const SOFT_SKILLS = [
  "leadership", "communication", "teamwork", "collaboration", "problem-solving",
  "analytical", "critical thinking", "creative", "innovative", "organized",
  "detail-oriented", "adaptable", "flexible", "time management", "prioritization",
  "multitasking", "self-motivated", "initiative", "work ethic", "accountability",
  "responsibility", "reliability", "dependability", "professionalism", "integrity",
  "honesty", "ethical", "emotional intelligence", "empathy", "patience", "persistence",
  "resilience", "stress management", "conflict resolution", "negotiation", "persuasion",
  "presentation", "public speaking", "written communication", "verbal communication",
  "interpersonal", "networking", "relationship building", "customer service", "client-facing",
  "stakeholder management", "cross-functional", "mentoring", "coaching", "training",
  "mentorship", "teaching", "delegation", "decision making", "strategic thinking",
  "strategic planning", "business acumen", "commercial awareness", "result-oriented",
  "goal-oriented", "data-driven", "evidence-based", "research", "investigative",
  "curiosity", "learning agility", "continuous learning", "self-improvement",
  "open-mindedness", "constructive feedback", "receptivity", "humility", "humor",
  "positivity", "optimism", "enthusiasm", "energy", "proactivity", "resourcefulness",
  "troubleshooting", "debugging", "diagnostic", "systematic", "methodical", "process-oriented",
  "quality-focused", "customer-centric", "user-centric", "agile mindset", "growth mindset",
];

const INDUSTRY_KEYWORDS = [
  "fintech", "healthtech", "edtech", "ecommerce", "saas", "b2b", "b2c", "marketplace",
  "startup", "enterprise", "smb", "enterprise software", "cloud computing", "ai/ml",
  "product-led growth", "sales-led", "digital transformation", "automation",
  "remote work", "hybrid", "gig economy", "on-demand", "subscription",
  "freemium", "premium", "enterprise", "saas", "paas", "iaas",
  "api-first", "mobile-first", "responsive", "progressive web app", "pwa",
  "single page application", "spa", "serverless", "jamstack", "headless cms",
  "crm", "erp", "hcm", "hr tech", "recruitment", "hr analytics", "people operations",
  "talent acquisition", "talent management", "workforce planning", "succession planning",
  "change management", "organizational development", "culture building", "employee engagement",
  "performance management", "kpi", "okr", "balanced scorecard",
  "product market fit", "go-to-market", "gtm", "market research", "competitive analysis",
  "swot", "porter's five forces", "business model canvas", "lean canvas",
  "unit economics", "ltv", "cac", "arpu", "arpu", "churn", "retention",
  "mrr", "arr", "runway", "burn rate", "revenue", "profitability",
  "investment", "fundraising", "seed", "series a", "series b", "ipo", "spac",
  "due diligence", "term sheet", "cap table", "valuation", "dilution",
  "governance", "compliance", "risk", "audit", "regulatory", "legal",
  "data protection", "privacy", "gdpr", "ccpa", "pci-dss", "soc2", "hipaa",
  "sustainability", "esg", "corporate social responsibility", "csr",
  "diversity", "inclusion", "belonging", "equity", "accessibility",
];
