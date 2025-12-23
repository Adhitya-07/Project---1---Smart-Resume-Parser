
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  highlights: string[];
}

export interface ParsedResume {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  contactInfo: ContactInfo;
  summary: string;
  education: Education[];
  experience: WorkExperience[];
  skills: string[];
  rawText?: string;
}

export interface ResumeProcessingResult {
  contactInfo: ContactInfo;
  summary: string;
  education: Education[];
  experience: WorkExperience[];
  skills: string[];
}

export interface ProjectReportData {
  introduction: string;
  abstract: string;
  toolsUsed: string[];
  stepsInvolved: string[];
  conclusion: string;
}
