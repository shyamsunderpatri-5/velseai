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
  const experienceScore = calculateExperienceScore(resumeText, jobDescription);

  const overallScore = Math.round(
    keywordScore * 0.4 +
      formatScore * 0.25 +
      skillsScore * 0.2 +
      experienceScore * 0.15
  );

  const issues = detectATSIssues(resumeText);
  const suggestions = generateSuggestions(
    allMissingKeywords,
    issues,
    formatScore,
    keywordScore,
    skillsScore,
    experienceScore
  );

  const experienceYearsFound = extractYearsOfExperience(resumeText);
  const experienceYearsRequired = extractYearsRequired(jobDescription);

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    keyword_score: keywordScore,
    format_score: formatScore,
    skills_score: skillsScore,
    experience_score: experienceScore,
    matched_keywords: allMatchedKeywords.slice(0, 30),
    missing_keywords: allMissingKeywords.slice(0, 20),
    hard_skills_matched: matchedHardSkills,
    hard_skills_missing: missingHardSkills,
    soft_skills_matched: matchedSoftSkills,
    ats_issues: issues,
    suggestions,
    experience_years_found: experienceYearsFound,
    experience_years_required: experienceYearsRequired,
    keyword_density: calculateKeywordDensity(resumeText, allMatchedKeywords),
    readability_score: calculateReadabilityScore(resumeText),
  };
}

function extractKeywords(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const uniqueWords = [...new Set(words)];

  const hardSkills = HARD_SKILLS.filter((skill) =>
    uniqueWords.some((w) => skill.toLowerCase().includes(w) || w.includes(skill.toLowerCase()))
  );

  const softSkills = SOFT_SKILLS.filter((skill) =>
    uniqueWords.some((w) => skill.toLowerCase().includes(w) || w.includes(skill.toLowerCase()))
  );

  const industryTerms = INDUSTRY_KEYWORDS.filter((term) =>
    uniqueWords.some((w) => term.toLowerCase().includes(w) || w.includes(term.toLowerCase()))
  );

  return { hardSkills, softSkills, industryTerms };
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

function calculateExperienceScore(resumeText: string, jobDescription: string): number {
  const yearsFound = extractYearsOfExperience(resumeText);
  const yearsRequired = extractYearsRequired(jobDescription);

  if (yearsRequired === null) return 80;
  if (yearsFound === null) return 50;

  if (yearsFound >= yearsRequired) return 100;
  return Math.round((yearsFound / yearsRequired) * 100);
}

function extractYearsOfExperience(text: string): number | null {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
    /(?:over\s*)?(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
    /experience[:\s]+(\d+)\+?\s*years?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
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
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
    /minimum\s*(?:of\s*)?(\d+)\+?\s*years?/i,
    /at\s*least\s*(\d+)\s*years?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }

  return null;
}

function detectATSIssues(text: string): string[] {
  const issues: string[] = [];

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
  if (text.length < 300) {
    issues.push("Resume is too short - aim for at least 500 words");
  }
  if (text.length > 2000) {
    issues.push("Resume is very long - consider trimming to 1-2 pages");
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
  experienceScore: number
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

  if (formatScore < 60) {
    highPriority.push("Fix formatting issues - remove tables, headers/footers, and images");
    highPriority.push("Ensure consistent date formats throughout");
  }

  if (skillsScore < 50) {
    highPriority.push("Add a dedicated skills section with keywords from the job description");
  }

  if (experienceScore < 50) {
    mediumPriority.push("Quantify your achievements with specific numbers and percentages");
  }

  if (keywordScore < 40) {
    mediumPriority.push("Include more relevant keywords from the job description naturally");
  }

  issues.forEach((issue) => {
    if (issue.includes("short")) {
      mediumPriority.push("Add more details to your experience bullets (aim for 3-5 per role)");
    }
    if (issue.includes("long")) {
      mediumPriority.push("Condense your resume to 1-2 pages maximum");
    }
  });

  mediumPriority.push("Use strong action verbs (Led, Built, Increased, Decreased, Achieved)");
  mediumPriority.push("Tailor your professional summary for this specific role");

  lowPriority.push("Consider adding metrics to every bullet point where applicable");
  lowPriority.push("Ensure your most relevant experience appears first");
  lowPriority.push("Review for any spelling or grammar errors");

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
  "github actions", "bitbucket", "jira", "confluence", "salesforce", "sap", "oracle",
  "salesforce crm", "hubspot", "marketing cloud", "seo", "sem", "google ads", "facebook ads",
  "analytics", "google analytics", "firebase", "supabase", "firebase", "stripe", "razorpay",
  "payment gateway", "blockchain", "solidity", "web3", "ethereum", "smart contracts",
  "networking", "tcp/ip", "dns", "vpn", "firewall", "security", "cybersecurity",
  "penetration testing", "ethical hacking", "iso 27001", "soc2", "gdpr", "data privacy",
  "project management", "product management", "business analysis", "requirements gathering",
  "uml", "bpmn", "process modeling", "erp", "crm", "salesforce", "zendesk",
  "copywriting", "content writing", "technical writing", "editing", "proofreading",
  "social media", "community management", "influencer marketing", "email marketing",
  "marketing automation", "lead generation", "conversion optimization", "ab testing",
  "financial modeling", "valuation", "excel modeling", "accounting", "taxation",
  "auditing", "risk management", "compliance", "regulatory", "investment banking",
  "private equity", "venture capital", "fund management", "portfolio management",
  "trading", "derivatives", "fixed income", "equity research", "credit analysis",
  "supply chain", "logistics", "inventory management", "procurement", "vendor management",
  "lean manufacturing", "six sigma", "quality assurance", "iso", "process improvement",
  "testing", "qa", "automation testing", "selenium", "cypress", "jest", "mocha",
  "junit", "testng", "load testing", "performance testing", "api testing", "postman",
  "crm", "dynamics", "zoho", "freshsales", "pipeline", "forecasting", "territory management",
  "account management", "client relations", "stakeholder management", "executive presence",
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
