import { GoogleGenAI, Type } from "@google/genai";
import { CareerRecommendation, LearningRoadmap, UserProfile, RoadmapStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const careerService = {
  async generateRecommendations(user: UserProfile): Promise<CareerRecommendation[]> {
    const skillsStr = (user.skills || []).map(s => typeof s === 'string' ? s : `${s.name} (${s.level})`).join(", ");
    const projectsStr = (user.projects || []).map(p => `${p.title}: ${p.description} (Tech: ${p.technologies.join(", ")})`).join("; ");
    const certsStr = (user.certifications || []).map(c => `${c.name} from ${c.issuer} (${c.date})`).join("; ");
    
    const prompt = `Based on the following detailed user profile, recommend 3 career paths.
    User Profile:
    - Skills: ${skillsStr}
    - Domain Knowledge: ${(user.knowledge || []).join(", ")}
    - Years of Experience: ${user.yearsOfExperience || 0}
    - Past Roles: ${(user.pastRoles || []).join(", ")}
    - Key Achievements: ${(user.achievements || []).join(", ")}
    - Projects: ${projectsStr || 'None listed'}
    - Certifications: ${certsStr || 'None listed'}
    - Interests: ${(user.interests || []).join(", ")}
    - Personality: ${user.personalityType || 'Unknown'}
    - Work Style: ${JSON.stringify(user.workStyle || {})}
    - Remote Preference: ${user.remotePreference || 'any'}
    
    Provide the response in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              salaryData: {
                type: Type.OBJECT,
                properties: {
                  entry: { type: Type.STRING },
                  mid: { type: Type.STRING },
                  senior: { type: Type.STRING }
                },
                required: ["entry", "mid", "senior"]
              },
              marketTrends: {
                type: Type.OBJECT,
                properties: {
                  growth: { type: Type.STRING, enum: ["Sunsetting", "Stable", "Booming"] },
                  demand: { type: Type.STRING }
                },
                required: ["growth", "demand"]
              },
              topCompanies: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "matchScore", "salaryData", "marketTrends", "topCompanies"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      ...item,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }));
  },

  async generateRoadmap(user: UserProfile, careerTitle: string): Promise<LearningRoadmap> {
    const skillsStr = (user.skills || []).map(s => typeof s === 'string' ? s : `${s.name} (${s.level})`).join(", ");
    const projectsStr = (user.projects || []).map(p => `${p.title}: ${p.description} (Tech: ${p.technologies.join(", ")})`).join("; ");
    const certsStr = (user.certifications || []).map(c => `${c.name} from ${c.issuer} (${c.date})`).join("; ");

    const prompt = `Create a step-by-step learning roadmap for a user to become a ${careerTitle}.
    User Profile:
    - Current Skills: ${skillsStr}
    - Domain Knowledge: ${(user.knowledge || []).join(", ")}
    - Experience: ${user.yearsOfExperience || 0} years
    - Past Roles: ${(user.pastRoles || []).join(", ")}
    - Projects: ${projectsStr || 'None listed'}
    - Certifications: ${certsStr || 'None listed'}
    
    Identify specific skill gaps based on their current level and provide specific resources.
    Provide the response in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  duration: { type: Type.STRING }
                },
                required: ["title", "description", "resources", "duration"]
              }
            }
          },
          required: ["skillGaps", "steps"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      userId: user.uid,
      careerTitle,
      skillGaps: data.skillGaps,
      steps: data.steps,
      createdAt: new Date().toISOString()
    };
  },

  async tailorResume(resumeText: string, targetRole: string): Promise<string> {
    const prompt = `Analyze this resume for the role of ${targetRole}. 
    Suggest specific keywords to add and bullet point adjustments to make it more competitive.
    Resume:
    ${resumeText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No feedback generated.";
  },

  async getInterviewFeedback(transcript: { role: string, content: string }[], role: string): Promise<string> {
    const prompt = `As an expert interviewer for the role of ${role}, provide constructive feedback on this interview transcript.
    Transcript:
    ${transcript.map(t => `${t.role}: ${t.content}`).join("\n")}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No feedback generated.";
  }
};
