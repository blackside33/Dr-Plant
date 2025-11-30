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
  isInsect: boolean;
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
مهمتك هي تحليل صورة وتقديم تشخيص وخطة علاج مفصلة. أنت خبير في أمراض النباتات وعلم الحشرات الزراعية ولديك معرفة متخصصة بالزراعة في الأردن.
يمكن للصورة أن تكون لنبات مصاب بمرض، أو لصورة حشرة/آفة زراعية تؤذي النباتات.

**بشكل حاسم، يجب عليك دائمًا تقديم استجابة JSON صالحة بناءً على المخطط، حتى لو كانت الصورة ليست لنبات/حشرة، أو كانت جودة الصورة رديئة.**

بناءً على الصورة المقدمة، قدم المعلومات التالية بتنسيق JSON منظم. لا تقم بتضمين أي نص أو تفسيرات أو تنسيق markdown خارج بنية JSON. يجب أن تكون جميع القيم النصية باللغة العربية.

يجب أن يحتوي كائن JSON على المفاتيح التالية: "isPlant", "isArtificialPlant", "isInsect", "disease" , "diseaseClassification"، "description" ، "treatments" ، "severityLevel" ، "severityDescription"، "imageQualityScore"، "imageQualityDescription".

1.  "isPlant": قيمة منطقية. اضبطها على \`true\` إذا كانت الصورة تحتوي على نبات، ورقة، زهرة، أو شجرة. **استثناء:** إذا كانت الصورة تحتوي على حشرة زراعية واضحة (حتى لو لم يكن النبات واضحًا تمامًا)، اضبط هذا أيضًا على \`true\` لأننا نريد تحليلها.
2.  "isArtificialPlant": قيمة منطقية. \`true\` إذا كان النبات صناعي/بلاستيكي. خلاف ذلك \`false\`.
3.  "isInsect": قيمة منطقية. اضبطها على \`true\` إذا كان الموضوع الرئيسي للصورة أو سبب المشكلة هو حشرة أو آفة زراعية (مثل المن، الديدان، الخنافس، العث). خلاف ذلك \`false\`.
4.  "disease": سلسلة نصية. اسم المرض أو اسم الحشرة/الآفة. إذا لم تكن صورة نبات ولا حشرة، اكتب "ليست صورة نبات أو حشرة". إذا كان نباتًا سليمًا، اكتب "نبات سليم".
5.  "diseaseClassification": تصنيف المرض (مثل "فطري", "بكتيري", "فيروسي"). **إذا كانت "isInsect" تساوي true، يجب أن يكون التصنيف "حشرة" أو "آفة".**
6.  "description": وصف موجز للمشكلة أو الحشرة.
7.  "treatments": مصفوفة نصائح العلاج. بالنسبة للحشرات، اقترح مبيدات حشرية أو طرق مكافحة مناسبة للسوق الأردني.
    *   "suggestedProducts" يجب أن تحتوي على منتجات متوفرة في الأردن (الاسم التجاري، الاسم العلمي، المادة الفعالة).
8.  "severityLevel": من 1 إلى 10.
9.  "severityDescription": تبرير درجة الخطورة.
10. "imageQualityScore": من 1 إلى 10.
11. "imageQualityDescription": تبرير جودة الصورة.
`;
    }

    // Default to English
    return `
Your task is to analyze an image and provide a detailed diagnosis and treatment plan. You are an expert plant pathologist and agricultural entomologist with specialized knowledge of agriculture in Jordan.
The image can be of a plant disease OR an agricultural insect/pest that harms plants.

**Crucially, you must always provide a valid JSON response based on the schema.**

Based on the provided image, provide the following information in a structured JSON format. Do not include any text outside of the JSON structure. All text values in the JSON should be in English.

The JSON object must have the following keys: "isPlant", "isArtificialPlant", "isInsect", "disease", "diseaseClassification", "description", "treatments", "severityLevel", "severityDescription", "imageQualityScore", "imageQualityDescription".

1.  "isPlant": Boolean. Set to \`true\` if the image contains a plant, leaf, flower, or tree. **Exception:** If the image clearly shows an agricultural insect/pest (even if the plant isn't fully clear), set this to \`true\` as we want to analyze it.
2.  "isArtificialPlant": Boolean. \`true\` if artificial/fake. Else \`false\`.
3.  "isInsect": Boolean. Set to \`true\` if the main subject or the cause of the issue is an insect or agricultural pest (e.g., aphids, worms, beetles, mites). Otherwise \`false\`.
4.  "disease": String. The name of the disease OR the name of the insect/pest. If not a plant/insect, use "Not a plant or insect image". If healthy, "Healthy Plant".
5.  "diseaseClassification": String. (e.g., "Fungal", "Bacterial"). **If "isInsect" is true, this MUST be "Insect" or "Pest".**
6.  "description": Concise description of the disease or insect.
7.  "treatments": Array of treatments. For insects, suggest insecticides or control methods suitable for the Jordanian market.
    *   "suggestedProducts" must contain products available in Jordan.
8.  "severityLevel": 1 to 10.
9.  "severityDescription": Justification for severity.
10. "imageQualityScore": 1 to 10.
11. "imageQualityDescription": Justification for image quality.
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
            isInsect: { type: Type.BOOLEAN },
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
          required: ['isPlant', 'isArtificialPlant', 'isInsect', 'disease', 'diseaseClassification', 'description', 'treatments', 'severityLevel', 'severityDescription', 'imageQualityScore', 'imageQualityDescription'],
        }
      },
    });

    const text = response.text || '';
    const jsonString = extractJson(text);
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
    
    // Fallback error objects
    const baseError = {
        isPlant: false,
        isArtificialPlant: false,
        isInsect: false,
        treatments: [],
        severityLevel: 0,
        imageQualityScore: 1,
    };

    if (language === 'ar') {
        return {
            ...baseError,
            disease: "فشل التحليل",
            diseaseClassification: "خطأ",
            description: "لم نتمكن من تحليل هذه الصورة. قد يكون هذا بسبب مشكلة في الشبكة، أو قد تكون الصورة غير قابلة للتمييز على الإطلاق.",
            severityDescription: "تعذر التحديد.",
            imageQualityDescription: "فشل التحليل، لذلك لا يمكن تقييم جودة الصورة."
        };
    }

    return {
        ...baseError,
        disease: "Analysis Failed",
        diseaseClassification: "Error",
        description: "We were unable to analyze this image. This might be due to a network issue, or the image may be completely unidentifiable.",
        severityDescription: "Could not be determined.",
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
        Use your search tool to get the most up-to-date, real-time weather information.
        Provide a weather forecast for ${locationString}.
        The response must be a single JSON object, enclosed in markdown format (\`\`\`json ... \`\`\`). Do not include any text or explanations outside of the JSON structure.
        ${langInstruction}

        The JSON object must contain the following keys:
        1. "current_temp": A number representing the current temperature in Celsius.
        2. "condition": A short string describing the current weather (e.g., "Sunny", "Rainy", "Partly Cloudy").
        3. "humidity": A number representing the current humidity percentage.
        4. "wind_speed": A number representing the current wind speed in kilometers per hour (km/h).
        5. "agricultural_summary": A brief, simple, and helpful summary for farmers based on the current weather and short-term forecast.
        6. "coordinates": An object with "lat" and "lon" keys (numbers) representing the exact latitude and longitude of the location found.
        7. "forecast": An array of exactly 10 objects, representing the forecast for the next 10 days. Each object must have:
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
                tools: [{googleSearch: {}}],
            },
        });
        const text = response.text || '';
        const jsonString = extractJson(text);
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
        Use your search tool to get information about the current season, weather patterns, and local conditions.
        Based on ${locationString} and the current date, provide practical planting suggestions.
        The response must be a single JSON object, enclosed in markdown format (\`\`\`json ... \`\`\`). Do not include any text or explanations outside of the JSON structure.
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
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text || '';
        const jsonString = extractJson(text);
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