import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DashboardConfig, ChartType } from '../types';

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A creative and relevant title for the dashboard based on the data context.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise executive summary of the dataset (2-3 sentences).",
    },
    charts: {
      type: Type.ARRAY,
      description: "A list of 4-6 recommended charts to visualize the data.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the chart" },
          type: { 
            type: Type.STRING, 
            enum: [ChartType.BAR, ChartType.LINE, ChartType.AREA, ChartType.PIE, ChartType.SCATTER],
            description: "The type of chart to render." 
          },
          title: { type: Type.STRING, description: "Title of the specific chart." },
          description: { type: Type.STRING, description: "A brief insight or explanation of what this chart shows." },
          xKey: { type: Type.STRING, description: "The key in the data object to use for the X-axis (category or time)." },
          yKeys: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "The keys in the data object to use for the Y-axis (values). For Pie charts, use only one key." 
          },
        },
        required: ["id", "type", "title", "description", "xKey", "yKeys"],
      },
    },
  },
  required: ["title", "summary", "charts"],
};

export const generateDashboardConfig = async (dataSample: string): Promise<DashboardConfig> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are an expert data analyst and visualization specialist.
    I will provide you with a sample of a dataset (headers, row count, and first 50 rows).
    
    Your task is to:
    1. Understand the domain and context of the data.
    2. Create a dashboard configuration with a title and summary.
    3. Recommend 4 to 6 insightful visualizations (charts) that best represent the patterns, trends, or comparisons in the data.
    
    For chart selection:
    - Use LINE charts for trends over time.
    - Use BAR charts for categorical comparisons.
    - Use AREA charts for cumulative totals or volume over time.
    - Use PIE charts for part-to-whole relationships (only if categories are few).
    - Use SCATTER charts for correlations between two numerical variables.
    
    Ensure 'xKey' and 'yKeys' exist exactly as written in the provided headers.
    
    Dataset Sample:
    ${dataSample}
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, 
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const config = JSON.parse(response.text) as DashboardConfig;
    return config;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze data. Please try again.");
  }
};
