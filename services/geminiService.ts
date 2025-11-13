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

export const isImageOfPlant = async (base64Image: string, mimeType: string): Promise<boolean> => {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const prompt = `
    Analyze the provided image. Your only task is to determine if the main subject of the image is a plant, a part of a plant (like a leaf or flower), or a tree.
    Respond with a single JSON object containing one key: "isPlant", which should be a boolean value (true if it is a plant/leaf/flower/tree, false otherwise).
    Do not provide any other text, explanation, or markdown formatting. Just the JSON object.
  `;

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };
  const textPart = {
    text: prompt
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
          },
          required: ['isPlant'],
        },
      },
    });

    const jsonString = extractJson(response.text);
    const parsedResponse: { isPlant: boolean } = JSON.parse(jsonString);
    return parsedResponse.isPlant;
  } catch (error) {
    console.error("Error during image plant verification with Gemini:", error);
     if (error instanceof Error) {
        throw new Error(`Gemini API Error during verification: ${error.message}`);
    }
    throw new Error('An unknown error occurred during image verification.');
  }
};


const getPrompt = (language: string): string => {
    if (language === 'ar') {
        return `
مهمتك هي تحليل صورة نبات وتقديم تشخيص وخطة علاج مفصلة. أنت خبير في أمراض النباتات ولديك معرفة متخصصة بالزراعة في الأردن.
**بشكل حاسم، يجب عليك دائمًا تقديم استجابة JSON صالحة بناءً على المخطط، حتى لو كانت جودة الصورة رديئة أو كان التشخيص غير مؤكد.**

بناءً على الصورة المقدمة، قدم المعلومات التالية بتنسيق JSON منظم. لا تقم بتضمين أي نص أو تفسيرات أو تنسيق markdown خارج بنية JSON.

حتى لو كانت جودة الصورة منخفضة جدًا (على سبيل المثال، ضبابية، إضاءة سيئة، خارج نطاق التركيز)، يجب عليك دائمًا محاولة تقديم تحليل. لا ترفض الصورة بسبب الجودة الرديئة. قدم تشخيصك الأكثر ترجيحًا واذكر بوضوح أن ثقتك منخفضة بسبب جودة الصورة في حقلي "description" أو "severityDescription". إذا كانت الصورة سيئة لدرجة أنه من المستحيل تمامًا تحديد أي شيء، فاملأ حقول JSON بقيم مثل "غير محدد" و "جودة صورة رديئة للغاية" مع الحفاظ على بنية JSON الصالحة دائمًا.

يجب أن يحتوي كائن JSON على المفاتيح التالية: "disease" ، "diseaseClassification"، "description" ، "treatments" ، "severityLevel" ، "severityDescription"، "imageQualityScore"، "imageQualityDescription". يجب أن تكون جميع القيم النصية باللغة العربية.

1.  "disease": سلسلة نصية تحدد اسم المرض الذي يصيب النبات. إذا كان النبات يبدو سليمًا، اذكر "نبات سليم". إذا لم تتمكن من تحديد المرض، اذكر "غير محدد".
2.  "diseaseClassification": سلسلة نصية تصنف المرض (على سبيل المثال، "فطري"، "بكتيري"، "فيروسي"، "آفة حشرية"، "نقص المغذيات"، "إجهاد بيئي"). إذا كان النبات سليمًا، استخدم "سليم". إذا كان المرض غير محدد، استخدم "غير محدد".
3.  "description": سلسلة نصية تحتوي على وصف موجز ومفيد للمرض. استخدم نقاطًا (على سبيل المثال، "- العرض 1\\n- السبب 1"). إذا كان غير محدد، اشرح السبب (على سبيل المثال، "الصورة ضبابية جدًا للتشخيص الدقيق.").
4.  "treatments": مصفوفة من كائنات العلاج. يجب أن يحتوي كل كائن على "type" ('كيميائي' أو 'بيولوجي')، و "description"، ومصفوفة "suggestedProducts" اختيارية. إذا كان النبات سليمًا أو المرض غير محدد، قدم نصائح عامة للعناية بالنباتات هنا.
    *   بالنسبة لـ "description"، استخدم تنسيق قائمة مرقمة (على سبيل المثال، "1. الخطوة الأولى\\n2. الخطوة الثانية").
    *   بالنسبة للعلاجات "الكيميائية"، تكون مصفوفة "suggestedProducts" إلزامية للأمراض المحددة. يجب أن تحتوي على ما لا يقل عن 2-3 كائنات، لكل منها "name" و "scientificName" و "activeIngredient" للمنتجات المتوفرة في الأردن. يمكن أن تكون هذه المصفوفة فارغة إذا كان المرض غير محدد أو للعلاجات البيولوجية.
    *   بالنسبة للعلاجات "البيولوجية"، صف الأساليب الطبيعية. يمكن حذف "suggestedProducts" أو تركها فارغة.
5.  "severityLevel": عدد صحيح من 1 إلى 10. إذا كان سليمًا، استخدم 1. إذا كان غير محدد، قدم درجة محايدة مثل 3 واشرح في الوصف.
6.  "severityDescription": سلسلة نصية تبرر درجة الخطورة. إذا كان غير محدد، اذكر الثقة المنخفضة بسبب جودة الصورة.
7.  "imageQualityScore": عدد صحيح من 1 إلى 10 يقيم جودة الصورة (التركيز، الإضاءة، الوضوح). 1 يعني جودة سيئة جداً، 10 يعني جودة ممتازة.
8.  "imageQualityDescription": سلسلة نصية تبرر درجة جودة الصورة، وتشير إلى كيفية تأثيرها على دقة التحليل.
`;
    }

    // Default to English
    return `
Your task is to analyze an image of a plant and provide a detailed diagnosis and treatment plan. You are an expert plant pathologist with specialized knowledge of agriculture in Jordan.
**Crucially, you must always provide a valid JSON response based on the schema, even if the image quality is poor or the diagnosis is uncertain.**

Based on the provided image, provide the following information in a structured JSON format. Do not include any text, explanations, or markdown formatting outside of the JSON structure.
All text values in the JSON should be in English.

Even if the image quality is very low (e.g., blurry, bad lighting, out of focus), you must always attempt an analysis. Do not reject the image due to poor quality. Provide your most likely diagnosis and explicitly state that your confidence is low due to image quality in the "description" or "severityDescription" fields. If the image is so poor that it is absolutely impossible to identify anything, populate the JSON fields with appropriate values like "Undetermined" and "Extremely poor image quality" while always maintaining a valid JSON structure.

The JSON object must have the following keys: "disease", "diseaseClassification", "description", "treatments", "severityLevel", "severityDescription", "imageQualityScore", "imageQualityDescription".

1.  "disease": A string identifying the name of the disease affecting the plant. If the plant appears healthy, state "Healthy Plant". If you cannot determine the disease, state "Undetermined".
2.  "diseaseClassification": A string classifying the disease (e.g., "Fungal", "Bacterial", "Viral", "Insect Pest", "Nutrient Deficiency", "Environmental Stress"). If the plant is healthy, use "Healthy". If the disease is undetermined, use "Undetermined".
3.  "description": A string containing a concise but informative description of the disease. Use bullet points (e.g., "- Symptom 1\\n- Cause 1") within the string. If undetermined, explain why (e.g., "Image is too blurry for accurate diagnosis.").
4.  "treatments": An array of treatment objects. Each object should have a "type" ('Chemical' or 'Biological'), a "description", and an optional "suggestedProducts" array. If the plant is healthy or the disease is undetermined, provide general plant care advice here.
    *   For "description", use a numbered list format (e.g., "1. First step\\n2. Second step").
    *   For "Chemical" treatments, the "suggestedProducts" array is mandatory for specific diseases. It must contain at least 2-3 objects, each with "name", "scientificName", and "activeIngredient" for products in Jordan. This array can be empty if the disease is undetermined or for biological treatments.
    *   For "Biological" treatments, describe natural methods. "suggestedProducts" can be omitted or empty.
5.  "severityLevel": An integer from 1 to 10. If healthy, use 1. If undetermined, provide a neutral score like 3 and explain in the description.
6.  "severityDescription": A string justifying the severity score. If undetermined, mention the low confidence due to image quality.
7.  "imageQualityScore": An integer from 1 to 10 rating the image quality (focus, lighting, clarity). 1 is very poor, 10 is excellent.
8.  "imageQualityDescription": A string justifying the image quality score, noting how it might affect the analysis accuracy.
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
            imageQualityScore: { type: Type.INTEGER },
            imageQualityDescription: { type: Type.STRING },
          },
          required: ['disease', 'diseaseClassification', 'description', 'treatments', 'severityLevel', 'severityDescription', 'imageQualityScore', 'imageQualityDescription'],
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
    
    if (language === 'ar') {
        return {
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
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the Gemini API for agricultural tips.');
    }
};