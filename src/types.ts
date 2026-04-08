export interface Project {
  title: string;
  description: string;
  link?: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  skills: { name: string, level: 'Beginner' | 'Intermediate' | 'Expert' }[];
  knowledge: string[];
  yearsOfExperience: number;
  pastRoles: string[];
  achievements: string[];
  projects: Project[];
  certifications: Certification[];
  interests: string[];
  personalityType?: string;
  workStyle?: {
    structure: number; // 1-10
    collaboration: number; // 1-10
    risk: number; // 1-10
    pace: number; // 1-10
  };
  currentRole?: string;
  targetRoles?: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
  savedRoadmaps?: string[]; // Array of roadmap IDs
  savedSteps?: { roadmapId: string, stepIndex: number }[];
  createdAt: string;
}

export interface CareerRecommendation {
  id?: string;
  userId: string;
  title: string;
  description: string;
  matchScore: number;
  salaryData: {
    entry: string;
    mid: string;
    senior: string;
  };
  marketTrends: {
    growth: 'Sunsetting' | 'Stable' | 'Booming';
    demand: string;
  };
  topCompanies: string[];
  createdAt: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  resources: string[];
  duration: string;
  completed?: boolean;
}

export interface LearningRoadmap {
  id?: string;
  userId: string;
  careerTitle: string;
  steps: RoadmapStep[];
  skillGaps: string[];
  createdAt: string;
}

export interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MockInterview {
  id?: string;
  userId: string;
  role: string;
  transcript: InterviewMessage[];
  feedback?: string;
  createdAt: string;
}
