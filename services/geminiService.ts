import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Treatment, WeatherData, AgriculturalTipsData } from '../types';

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


export const getWeatherForecast = async (lat: number, lon: number, language: string): Promise<WeatherData> => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const langInstruction = language === 'ar'
        ? "All text values in the JSON response must be in Arabic."
        : "All text values in the JSON response must be in English.";

    const prompt = `
        You are a helpful meteorological assistant specializing in agricultural advice.
        Provide a weather forecast for the location with latitude ${lat} and longitude ${lon}.
        The response must be a single JSON object. Do not include any text, explanations, or markdown formatting outside of the JSON structure.
        ${langInstruction}

        The JSON object must contain the following keys:
        1. "current_temp": A number representing the current temperature in Celsius.
        2. "condition": A short string describing the current weather (e.g., "Sunny", "Partly Cloudy").
        3. "humidity": A number representing the current humidity percentage.
        4. "wind_speed": A number representing the current wind speed in kilometers per hour (km/h).
        5. "agricultural_summary": A brief, simple, and helpful summary for farmers based on the current weather and short-term forecast.
        6. "forecast": An array of exactly 3 objects, representing the forecast for the next three days. Each object must have:
            - "day": The name of the day (e.g., "Monday", "Tuesday").
            - "min_temp": The minimum forecasted temperature in Celsius.
            - "max_temp": The maximum forecasted temperature in Celsius.
            - "condition": A short string describing the day's forecasted weather.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        current_temp: { type: Type.NUMBER },
                        condition: { type: Type.STRING },
                        humidity: { type: Type.NUMBER },
                        wind_speed: { type: Type.NUMBER },
                        agricultural_summary: { type: Type.STRING },
                        forecast: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    min_temp: { type: Type.NUMBER },
                                    max_temp: { type: Type.NUMBER },
                                    condition: { type: Type.STRING },
                                },
                                required: ['day', 'min_temp', 'max_temp', 'condition'],
                            },
                        },
                    },
                    required: ['current_temp', 'condition', 'humidity', 'wind_speed', 'agricultural_summary', 'forecast'],
                },
            },
        });
        const jsonString = response.text;
        const parsedResponse: WeatherData = JSON.parse(jsonString);
        return parsedResponse;
    } catch (error) {
        console.error("Error getting weather forecast from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the Gemini API for weather data.');
    }
};


export const getAgriculturalTips = async (lat: number, lon: number, language: string): Promise<AgriculturalTipsData> => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const langInstruction = language === 'ar'
        ? "All text values in the JSON response must be in Arabic."
        : "All text values in the JSON response must be in English.";

    const prompt = `
        You are an expert agricultural advisor with deep knowledge of Jordanian climate and soil.
        Based on the provided location (latitude: ${lat}, longitude: ${lon}) and the current date, provide practical planting suggestions.
        The response must be a single JSON object. Do not include any text, explanations, or markdown formatting outside of the JSON structure.
        ${langInstruction}

        The JSON object must have the following keys:
        1. "summary": A string providing a general summary of the current planting season and conditions for the region.
        2. "suggestions": An array of at least 3-4 plant suggestion objects. Each object must have:
            - "plantName": The name of the suggested plant or crop.
            - "plantingAdvice": A string with concise, actionable advice for planting this crop now (e.g., soil preparation, timing).
            - "productivityOutlook": A string describing the expected yield, benefits, or market opportunities for this crop.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    plantName: { type: Type.STRING },
                                    plantingAdvice: { type: Type.STRING },
                                    productivityOutlook: { type: Type.STRING },
                                },
                                required: ['plantName', 'plantingAdvice', 'productivityOutlook'],
                            },
                        },
                    },
                    required: ['summary', 'suggestions'],
                },
            },
        });

        const jsonString = response.text;
        const parsedResponse: AgriculturalTipsData = JSON.parse(jsonString);
        return parsedResponse;
    } catch (error) {
        console.error("Error getting agricultural tips from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the Gemini API for agricultural tips.');
    }
};
