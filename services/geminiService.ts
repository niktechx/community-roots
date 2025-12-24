
import { GoogleGenAI, Type } from "@google/genai";
import { Person } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getIndianKinshipTerm(pathDescription: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert in Indian genealogy and kinship terms. 
      Given a family relationship path: "${pathDescription}", 
      identify the specific North Indian (Hindi-based) kinship term (e.g., Chacha, Tau, Mama, Bua, Nanad, etc.). 
      Explain briefly why it's used. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["term", "explanation"]
        }
      }
    });
    const result = JSON.parse(response.text);
    return `${result.term} (${result.explanation})`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unknown Relation";
  }
}

export async function resolveEntity(newPerson: Partial<Person>, existingPeople: Person[]): Promise<{ match: Person | null, confidence: number }> {
  try {
    const prompt = `Analyze if the following person profile is a duplicate of any existing records.
    New Person: ${JSON.stringify(newPerson)}
    Existing Records: ${JSON.stringify(existingPeople.slice(0, 20))}
    
    Return the match ID and confidence score (0-100) based on Name, DOB, and Locations.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchId: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["matchId", "confidence"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    const matched = existingPeople.find(p => p.id === result.matchId);
    
    if (result.confidence > 70 && matched) {
      return { match: matched, confidence: result.confidence };
    }
    return { match: null, confidence: 0 };
  } catch (error) {
    return { match: null, confidence: 0 };
  }
}
