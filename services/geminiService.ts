import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Treatment, WeatherData, AgriculturalTipsData } from '../types';

// Helper function to extract JSON from a string that might contain markdown
const extractJson = (text: string): string => {
    const trimmedText = text.trim();
    // Match the JSON block within markdown code fences
    const jsonMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1];
    }
    // If no markdown fence, return the trimmed text as is
    return trimmedText;
};


export interface AnalysisResponse {
  isPlant: boolean;
  isArtificialPlant: boolean;
  disease: string;
  diseaseClassification: string;
  description: string;
  treatments: Treatment[];
  severityLevel: number;
  severityDescription: string;
  imageQualityScore: number;
  imageQualityDescription: string;
}

export interface LocationQuery {
    lat?: number;
    lon?: number;
    name?: string;
}

const getPrompt = (language: string): string => {
    if (language === 'ar') {
        return `
مهمتك هي تحليل صورة وتقديم تشخيص وخطة علاج مفصلة إذا كانت الصورة لنبات حقيقي. أنت خبير في أمراض النباتات ولديك معرفة متخصصة بالزراعة في الأردن.
**بشكل حاسم، يجب عليك دائمًا تقديم استجابة JSON صالحة بناءً على المخطط، حتى لو كانت الصورة ليست لنبات، أو كانت لنبات صناعي، أو كانت جودة الصورة رديئة.**

بناءً على الصورة المقدمة، قدم المعلومات التالية بتنسيق JSON منظم. لا تقم بتضمين أي نص أو تفسيرات أو تنسيق markdown خارج بنية JSON. يجب أن تكون جميع القيم النصية باللغة العربية.

يجب أن يحتوي كائن JSON على المفاتيح التالية: "isPlant", "isArtificialPlant", "disease" , "diseaseClassification"، "description" ، "treatments" ، "severityLevel" ، "severityDescription"، "imageQualityScore"، "imageQualityDescription".

1.  "isPlant": قيمة منطقية (boolean). اضبطها على \`true\` إذا كان الموضوع الرئيسي في الصورة هو نبات، ورقة، زهرة، أو شجرة. وإلا، اضبطها على \`false\`.
2.  "isArtificialPlant": قيمة منطقية (boolean). اضبطها على \`true\` إذا كنت واثقًا من أن النبات المعروض صناعي أو مزيف أو بلاستيكي. اضبطها على \`false\` إذا كان نباتًا حقيقيًا حيًا. إذا كانت "isPlant" قيمتها \`false\`, يجب أن تكون هذه القيمة \`false\` أيضًا.
3.  "disease": سلسلة نصية تحدد اسم المرض. إذا كان "isPlant" قيمتها \`false\`, استخدم "ليست صورة نبات". إذا كان "isArtificialPlant" قيمتها \`true\`, استخدم "نبات صناعي". إذا كان النبات سليمًا، اذكر "نبات سليم". إذا لم تتمكن من تحديد المرض، اذكر "غير محدد".
4.  "diseaseClassification": سلسلة نصية تصنف المرض (مثل "فطري", "بكتيري"). إذا كان "isPlant" قيمتها \`false\` أو "isArtificialPlant" قيمتها \`true\`, استخدم "غير قابل للتطبيق".
5.  "description": وصف موجز. إذا كانت ليست نباتًا أو كانت نباتًا صناعيًا، فاذكر ذلك بوضوح هنا. خلاف ذلك، صف المرض باستخدام نقاط.
6.  "treatments": مصفوفة من كائنات العلاج. إذا كانت ليست نباتًا، أو كانت نباتًا صناعيًا، أو كان النبات سليمًا، يجب أن تكون هذه المصفوفة فارغة أو تحتوي على نصائح عامة.
    *   بالنسبة لـ "description"، استخدم تنسيق قائمة مرقمة (على سبيل المثال، "1. الخطوة الأولى\\n2. الخطوة الثانية").
    *   بالنسبة للعلاجات "الكيميائية"، تكون مصفوفة "suggestedProducts" إلزامية للأمراض المحددة. يجب أن تحتوي على ما لا يقل عن 2-3 كائنات، لكل منها "name" و "scientificName" و "activeIngredient" للمنتجات المتوفرة في الأردن.
7.  "severityLevel": عدد صحيح من 1 إلى 10. إذا كانت ليست نباتًا أو كانت نباتًا صناعيًا، استخدم 0. إذا كان سليمًا، استخدم 1.
8.  "severityDescription": سلسلة نصية تبرر درجة الخطورة.
9.  "imageQualityScore": عدد صحيح من 1 إلى 10 يقيم جودة الصورة (التركيز، الإضاءة، الوضوح).
10. "imageQualityDescription": سلسلة نصية تبرر درجة جودة الصورة.
`;
    }

    // Default to English
    return `
Your task is to analyze an image and provide a detailed diagnosis and treatment plan if the image is of a real plant. You are an expert plant pathologist with specialized knowledge of agriculture in Jordan.
**Crucially, you must always provide a valid JSON response based on the schema, even if the image is not of a plant, is of an artificial plant, or the image quality is poor.**

Based on the provided image, provide the following information in a structured JSON format. Do not include any text, explanations, or markdown formatting outside of the JSON structure. All text values in the JSON should be in English.

The JSON object must have the following keys: "isPlant", "isArtificialPlant", "disease", "diseaseClassification", "description", "treatments", "severityLevel", "severityDescription", "imageQualityScore", "imageQualityDescription".

1.  "isPlant": A boolean value. Set to \`true\` if the main subject of the image is a plant, leaf, flower, or tree. Otherwise, set to \`false\`.
2.  "isArtificialPlant": A boolean value. Set to \`true\` if you are confident the plant shown is artificial, fake, or plastic. Set to \`false\` if it is a real, living plant. If "isPlant" is false, this should also be false.
3.  "disease": A string identifying the disease. If "isPlant" is \`false\`, use "Not a plant image". If "isArtificialPlant" is \`true\`, use "Artificial Plant". If the plant appears healthy, state "Healthy Plant". If undetermined, state "Undetermined".
4.  "diseaseClassification": A string classifying the disease (e.g., "Fungal", "Bacterial"). If "isPlant" is \`false\` or "isArtificialPlant" is \`true\`, use "Not Applicable".
5.  "description": A concise description. If not a plant or an artificial plant, state that clearly here. Otherwise, describe the disease using bullet points.
6.  "treatments": An array of treatment objects. If not a plant, an artificial plant, or a healthy plant, this array should be empty or contain general advice.
    *   For "description", use a numbered list format (e.g., "1. First step\\n2. Second step").
    *   For "Chemical" treatments, the "suggestedProducts" array is mandatory for specific diseases. It must contain at least 2-3 objects, each with "name", "scientificName", and "activeIngredient" for products in Jordan.
7.  "severityLevel": An integer from 1 to 10. If not a plant or an artificial plant, use 0. If healthy, use 1.
8.  "severityDescription": A string justifying the severity score.
9.  "imageQualityScore": An integer from 1 to 10 rating the image quality (focus, lighting, clarity).
10. "imageQualityDescription": A string justifying the image quality score.
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
            isPlant: { type: Type.BOOLEAN },
            isArtificialPlant: { type: Type.BOOLEAN },
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
            imageQualityScore: { type: Type.INTEGER },
            imageQualityDescription: { type: Type.STRING },
          },
          required: ['isPlant', 'isArtificialPlant', 'disease', 'diseaseClassification', 'description', 'treatments', 'severityLevel', 'severityDescription', 'imageQualityScore', 'imageQualityDescription'],
        }
      },
    });

    const jsonString = extractJson(response.text);
    if (!jsonString) {
      throw new Error("Received empty response text from Gemini.");
    }
    const parsedResponse: AnalysisResponse = JSON.parse(jsonString);
     if (!parsedResponse || !parsedResponse.disease) {
      throw new Error("Parsed JSON from Gemini is empty or invalid.");
    }
    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);

    if (error instanceof Error) {
        const errorMessage = error.message || '';
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota exceeded')) {
            throw new Error('SERVICE_UNAVAILABLE');
        }
    }
    
    if (language === 'ar') {
        return {
            isPlant: false,
            isArtificialPlant: false,
            disease: "فشل التحليل",
            diseaseClassification: "خطأ",
            description: "لم نتمكن من تحليل هذه الصورة. قد يكون هذا بسبب مشكلة في الشبكة، أو قد تكون الصورة غير قابلة للتمييز على الإطلاق.",
            treatments: [],
            severityLevel: 0,
            severityDescription: "تعذر التحديد.",
            imageQualityScore: 1,
            imageQualityDescription: "فشل التحليل، لذلك لا يمكن تقييم جودة الصورة."
        };
    }

    return {
        isPlant: false,
        isArtificialPlant: false,
        disease: "Analysis Failed",
        diseaseClassification: "Error",
        description: "We were unable to analyze this image. This might be due to a network issue, or the image may be completely unidentifiable.",
        treatments: [],
        severityLevel: 0,
        severityDescription: "Could not be determined.",
        imageQualityScore: 1,
        imageQualityDescription: "Analysis failed, so image quality could not be assessed."
    };
  }
};


export const getWeatherForecast = async (location: LocationQuery, language: string): Promise<WeatherData> => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const langInstruction = language === 'ar'
        ? "All text values in the JSON response must be in Arabic."
        : "All text values in the JSON response must be in English.";

    const locationString = location.lat && location.lon
        ? `the location with latitude ${location.lat} and longitude ${location.lon}`
        : `the city of '${location.name}, Jordan'`;


    const prompt = `
        You are a helpful meteorological assistant specializing in agricultural advice.
        Provide a weather forecast for ${locationString}.
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
        const jsonString = extractJson(response.text);
        const parsedResponse: WeatherData = JSON.parse(jsonString);
        return parsedResponse;
    } catch (error) {
        console.error("Error getting weather forecast from Gemini:", error);
        if (error instanceof Error) {
            const errorMessage = error.message || '';
            if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota exceeded')) {
                throw new Error('SERVICE_UNAVAILABLE');
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the Gemini API for weather data.');
    }
};


export const getAgriculturalTips = async (location: LocationQuery, language: string): Promise<AgriculturalTipsData> => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const langInstruction = language === 'ar'
        ? "All text values in the JSON response must be in Arabic."
        : "All text values in the JSON response must be in English.";
    
    const locationString = location.lat && location.lon
        ? `the provided location (latitude: ${location.lat}, longitude: ${location.lon})`
        : `the city of '${location.name}, Jordan'`;


    const prompt = `
        You are an expert agricultural advisor with deep knowledge of Jordanian climate and soil.
        Based on ${locationString} and the current date, provide practical planting suggestions.
        The response must be a single JSON object. Do not include any text, explanations, or markdown formatting outside of the JSON structure.
        ${langInstruction}

        The JSON object must have the following keys:
        1. "summary": A string providing a general summary of the current planting season and conditions for the region.
        2. "suggestions": An array of at least 3-4 plant suggestion objects. The suggestions should include a mix of both productive crops (like vegetables or fruits) and ornamental plants (like flowers or decorative shrubs). Each object must have:
            - "plantName": The name of the suggested plant or crop.
            - "plantingAdvice": A string with concise, actionable advice for planting this crop now (e.g., soil preparation, timing).
            - "productivityOutlook": A string describing the expected yield, benefits, or market opportunities for this crop. For ornamental plants, this should describe their aesthetic value, flowering season, or care benefits.
            - "category": A string that must be either 'Productive' for crops like vegetables or fruits, or 'Ornamental' for plants like flowers or decorative shrubs.
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
                                    category: { type: Type.STRING },
                                },
                                required: ['plantName', 'plantingAdvice', 'productivityOutlook', 'category'],
                            },
                        },
                    },
                    required: ['summary', 'suggestions'],
                },
            },
        });

        const jsonString = extractJson(response.text);
        const parsedResponse: AgriculturalTipsData = JSON.parse(jsonString);
        return parsedResponse;
    } catch (error) {
        console.error("Error getting agricultural tips from Gemini:", error);
        if (error instanceof Error) {
            const errorMessage = error.message || '';
            if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota exceeded')) {
                throw new Error('SERVICE_UNAVAILABLE');
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the Gemini API for agricultural tips.');
    }
};