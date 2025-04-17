import { Enquiry } from "@/types/invoice";
import OpenAI from "openai";

/**
 * Process text using OpenAI to extract enquiry information
 */
export const processEnquiryText = async (text: string): Promise<Partial<Enquiry>> => {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please add it in the settings.");
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that extracts structured information from enquiry texts.
          Extract the following information if available:
          - Customer name
          - Phone number
          - Email address
          - Whether they use WhatsApp (default to false if not mentioned)
          - Moving date
          - From address
          - Number of bedrooms (default to 2 if not mentioned)
          - To address
          - Any access issues
          - Whether they're getting more quotes (default to false if not mentioned)
          - Services needed (packaging, storage, disassembly)
          - Any additional notes

          Format your response as a valid JSON object with these fields:
          {
            "customerName": string,
            "phone": string,
            "hasWhatsapp": boolean,
            "email": string,
            "moveDate": string (YYYY-MM-DD format if possible),
            "fromAddress": string,
            "fromBedrooms": number,
            "toAddress": string,
            "accessIssues": string,
            "gettingMoreQuotes": boolean,
            "services": {
              "packaging": boolean,
              "storage": boolean,
              "disassembly": boolean
            },
            "notes": string
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      const parsedData = JSON.parse(content);
      return parsedData;
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse the AI response");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};

/**
 * Get the OpenAI API key from localStorage
 */
export const getOpenAIApiKey = (): string | null => {
  try {
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    return settings.openaiApiKey || null;
  } catch (e) {
    console.error("Error retrieving OpenAI API key:", e);
    return null;
  }
};

/**
 * Check if OpenAI API key is configured
 */
export const isOpenAIConfigured = (): boolean => {
  const apiKey = getOpenAIApiKey();
  return !!apiKey;
};
