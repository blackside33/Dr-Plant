import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Treatment } from '../types';

export interface AnalysisResponse {
  disease: string;
  diseaseClassification: string;
  description: string;
  treatments: Treatment[];
  severityLevel: number;
  severityDescription: string;
}

const getPrompt = (language: string): string => {
    const commonInstructions = `
Your task is to analyze an image of a plant and provide a detailed diagnosis and treatment plan. You are an expert plant pathologist with specialized knowledge of agriculture in Jordan.
Based on the provided image, provide the following information in a structured JSON format. Do not include any text, explanations, or markdown formatting outside of the JSON structure.

The JSON object must have the following keys: "disease", "diseaseClassification", "description", "treatments", "severityLevel", "severityDescription".

1.  "disease": A string identifying the name of the disease affecting the plant. If the plant is healthy, state that. If you cannot determine the disease, say so.
2.  "diseaseClassification": A string classifying the disease (e.g., "Fungal", "Bacterial", "Viral", "Insect Pest", "Nutrient Deficiency", "Environmental Stress").
3.  "description": A string containing a concise but informative description of the disease. Use bullet points (e.g., "- Symptom 1\\n- Cause 1") within the string to list its common symptoms and causes for better readability.
4.  "treatments": An array of treatment objects. Each object should have a "type" ('Chemical' or 'Biological'), a "description", and an optional "suggestedProducts" array.
    *   For "description", use a numbered list format (e.g., "1. First step\\n2. Second step") if there are multiple steps.
    *   For "Chemical" treatments, the "suggestedProducts" array is mandatory. It must contain at least 2-3 objects, each with "name" (specific commercial product name commonly available in the Jordanian market), "scientificName" (the scientific name of the active ingredient), and "activeIngredient" (the product's main active ingredient).
    *   For "Biological" treatments, describe natural or organic methods. "suggestedProducts" can be omitted or empty.
5.  "severityLevel": An integer from 1 to 10 (where 1 is low risk and 10 is extremely high risk) assessing the disease severity.
6.  "severityDescription": A string with a brief justification for the severity score.
`;
    if (language === 'ar') {
        return `
مهمتك هي تحليل صورة نبات وتقديم تشخيص وخطة علاج مفصلة. أنت خبير في أمراض النباتات ولديك معرفة متخصصة بالزراعة في الأردن.
بناءً على الصورة المقدمة، قدم المعلومات التالية بتنسيق JSON منظم. لا تقم بتضمين أي نص أو تفسيرات أو تنسيق markdown خارج بنية JSON.

يجب أن يحتوي كائن JSON على المفاتيح التالية: "disease" ، "diseaseClassification"، "description" ، "treatments" ، "severityLevel" ، "severityDescription". يجب أن تكون جميع القيم النصية باللغة العربية.
${commonInstructions}
`;
    }

    return `
All text values in the JSON should be in English.
${commonInstructions}
`;
};


export const analyzePlantImage = async (base64Image: string, mimeType: string, language: string): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  
  const promptText = getPrompt(language);

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };
  const textPart = {
    text: promptText
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disease: { type: Type.STRING },
            diseaseClassification: { type: Type.STRING },
            description: { type: Type.STRING },
            treatments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestedProducts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        scientificName: { type: Type.STRING },
                        activeIngredient: { type: Type.STRING },
                      },
                      required: ['name', 'scientificName', 'activeIngredient'],
                    },
                  },
                },
                required: ['type', 'description'],
              },
            },
            severityLevel: { type: Type.INTEGER },
            severityDescription: { type: Type.STRING },
          },
          required: ['disease', 'diseaseClassification', 'description', 'treatments', 'severityLevel', 'severityDescription'],
        }
      },
    });

    const jsonString = response.text;
    const parsedResponse: AnalysisResponse = JSON.parse(jsonString);
    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the Gemini API.');
  }
};