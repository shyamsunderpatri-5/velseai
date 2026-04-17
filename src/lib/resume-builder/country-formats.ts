export type CountryFormatId = 
  | "usa_canada" 
  | "uk_australia" 
  | "germany_europe" 
  | "india" 
  | "middle_east" 
  | "international";

export interface CountryFormatRule {
  id: CountryFormatId;
  label: string;
  title: string;          // e.g., "Resume", "CV", "Lebenslauf"
  targetPages: number[];  // e.g., [1], [1, 2], [2, 3]
  rules: {
    photo: "forbidden" | "optional" | "mandatory" | "recommended";
    dateOfBirth: "forbidden" | "optional" | "mandatory";
    nationality: "forbidden" | "optional" | "mandatory";
    maritalStatus: "forbidden" | "optional" | "mandatory";
    fathersName: "forbidden" | "optional";
    visaStatus: "forbidden" | "optional" | "mandatory";
    religion: "forbidden" | "optional";
    references: "forbidden" | "optional" | "important";
    declaration: boolean; // mostly for India
    signature: boolean;   // mostly for Germany
  };
  sectionOrder: string[]; 
  guidelines: string[];
}

export const COUNTRY_FORMATS: Record<CountryFormatId, CountryFormatRule> = {
  usa_canada: {
    id: "usa_canada",
    label: "USA & Canada",
    title: "Resume",
    targetPages: [1],
    rules: {
      photo: "forbidden",
      dateOfBirth: "forbidden",
      nationality: "forbidden",
      maritalStatus: "forbidden",
      fathersName: "forbidden",
      visaStatus: "optional", // Only if explicitly asking for sponsorship info, usually hidden
      religion: "forbidden",
      references: "forbidden", // "Available upon request" is considered outdated in US
      declaration: false,
      signature: false,
    },
    sectionOrder: ["contact", "summary", "experience", "skills", "education", "certificates"],
    guidelines: [
      "Use strong action verbs (Led, Built, Achieved, Managed).",
      "Quantify achievements heavily (e.g., 'increased sales by 40%').",
      "Maintain a strict single column format for ATS tracking systems.",
      "Use standard web-safe fonts: Calibri, Arial, or Georgia.",
      "Set margins to exactly 0.75 inch."
    ]
  },
  uk_australia: {
    id: "uk_australia",
    label: "UK & Australia",
    title: "CV",
    targetPages: [1, 2],
    rules: {
      photo: "forbidden",
      dateOfBirth: "forbidden",
      nationality: "optional",
      maritalStatus: "forbidden",
      fathersName: "forbidden",
      visaStatus: "optional",
      religion: "forbidden",
      references: "important",
      declaration: false,
      signature: false,
    },
    sectionOrder: ["contact", "summary", "experience", "education", "skills", "references"],
    guidelines: [
      "Include a 'Personal Statement' at the top instead of an objective.",
      "Use British English spelling (e.g., 'optimised', 'programme').",
      "List references as 'Available upon request' at the bottom."
    ]
  },
  germany_europe: {
    id: "germany_europe",
    label: "Germany & Europe",
    title: "Lebenslauf",
    targetPages: [2, 3],
    rules: {
      photo: "mandatory",
      dateOfBirth: "mandatory",
      nationality: "mandatory",
      maritalStatus: "optional",
      fathersName: "forbidden",
      visaStatus: "optional",
      religion: "forbidden",
      references: "optional",
      declaration: false,
      signature: true,
    },
    sectionOrder: ["contact", "summary", "experience", "education", "skills", "certificates"],
    guidelines: [
      "Include a professional headshot placeholder.",
      "Include a formal signature line at the very bottom (Ort, Datum, Unterschrift).",
      "Maintain a highly formal, precise tone."
    ]
  },
  india: {
    id: "india",
    label: "India",
    title: "Resume",
    targetPages: [2, 3],
    rules: {
      photo: "optional",
      dateOfBirth: "optional", // commonly included
      nationality: "optional",
      maritalStatus: "optional",
      fathersName: "optional",
      visaStatus: "forbidden",
      religion: "forbidden",
      references: "optional",
      declaration: true,
      signature: false,
    },
    sectionOrder: ["contact", "summary", "experience", "projects", "education", "skills", "certificates", "declaration"],
    guidelines: [
      "Use a 'Career Objective' rather than just a summary.",
      "Hobbies and interests sections are commonly accepted.",
      "Include a formal 'Declaration' at the bottom asserting facts are true."
    ]
  },
  middle_east: {
    id: "middle_east",
    label: "Middle East (Dubai, etc.)",
    title: "CV",
    targetPages: [2, 3],
    rules: {
      photo: "recommended",
      dateOfBirth: "optional",
      nationality: "mandatory",
      maritalStatus: "optional",
      fathersName: "forbidden",
      visaStatus: "mandatory",
      religion: "optional",
      references: "important",
      declaration: false,
      signature: false,
    },
    sectionOrder: ["contact", "summary", "experience", "education", "skills", "references"],
    guidelines: [
      "Clear visa status and availability to join must be highlighted.",
      "Include a professional headshot.",
      "References are highly valued in the recruitment culture."
    ]
  },
  international: {
    id: "international",
    label: "Universal / International",
    title: "Resume",
    targetPages: [1, 2],
    rules: {
      photo: "optional",
      dateOfBirth: "forbidden",
      nationality: "forbidden",
      maritalStatus: "forbidden",
      fathersName: "forbidden",
      visaStatus: "forbidden",
      religion: "forbidden",
      references: "optional",
      declaration: false,
      signature: false,
    },
    sectionOrder: ["contact", "summary", "experience", "education", "skills"],
    guidelines: [
      "Maintain a clean, minimal format universally readable.",
      "Focus purely on professional capability and metrics.",
      "Avoid region-specific quirks."
    ]
  }
};
