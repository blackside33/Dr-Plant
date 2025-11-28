

export interface SuggestedProduct {
  name: string;
  scientificName: string;
  activeIngredient: string;
}

export interface Treatment {
  type: 'Chemical' | 'Biological';
  description: string;
  suggestedProducts?: SuggestedProduct[];
}

export interface AnalysisResultData {
  id: string;
  imageUrl: string;
  timestamp: string;
  disease: string;
  diseaseClassification: string;
  description: string;
  treatments: Treatment[];
  severityLevel: number;
  severityDescription: string;
  language: string;
  imageQualityScore: number;
  imageQualityDescription: string;
  isInsect?: boolean;
}

export interface ForecastDay {
  day: string;
  min_temp: number;
  max_temp: number;
  condition: string;
}

export interface WeatherData {
  current_temp: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  agricultural_summary: string;
  forecast: ForecastDay[];
}

export interface PlantSuggestion {
  plantName: string;
  plantingAdvice: string;
  productivityOutlook: string;
  category: 'Productive' | 'Ornamental';
}

export interface AgriculturalTipsData {
  summary: string;
  suggestions: PlantSuggestion[];
}