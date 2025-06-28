import OpenAI from "openai";
import { config } from 'dotenv';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TripDay {
  day: number;
  date: string;
  activities: Array<{
    time: string;
    activity: string;
    location: string;
    cost: string;
    category: string;
    description?: string;
  }>;
  totalCost: string;
}

interface TripItinerary {
  destination: string;
  duration: string;
  totalBudget: string;
  overview: string;
  days: TripDay[];
}

export async function generateItinerary(description: string): Promise<TripItinerary> {
  const prompt = `You are a professional travel planner. Create a detailed day-by-day itinerary based on this description: "${description}"

Please respond with a JSON object that follows this exact structure:
{
  "destination": "City, Country",
  "duration": "X days",
  "totalBudget": "$X,XXX",
  "overview": "Brief overview of the trip highlighting key experiences",
  "days": [
    {
      "day": 1,
      "date": "Day of week, Month Date",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "location": "Specific location/address",
          "cost": "$XX",
          "category": "food|activity|transport|accommodation|shopping|sightseeing",
          "description": "Brief description of the activity"
        }
      ],
      "totalCost": "$XXX"
    }
  ]
}

Guidelines:
- Create realistic timing and costs
- Include a mix of activities (sightseeing, food, culture, etc.)
- Consider travel time between locations
- Provide specific location names and addresses when possible
- Make sure daily costs add up to the total budget
- Include breakfast, lunch, dinner, and activities
- Consider the user's preferences mentioned in the description
- Make it practical and achievable

Return only the JSON object, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional travel planner who creates detailed, realistic itineraries. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const itinerary = JSON.parse(content) as TripItinerary;
    
    // Validate the structure
    if (!itinerary.destination || !itinerary.days || !Array.isArray(itinerary.days)) {
      throw new Error("Invalid itinerary structure received from AI");
    }

    return itinerary;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    
    throw new Error("Failed to generate itinerary. Please try again with a more detailed description.");
  }
}