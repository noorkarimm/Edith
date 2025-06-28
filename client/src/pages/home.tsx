import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, DollarSign, Clock, Users, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

export default function Home() {
  const [description, setDescription] = useState("");
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);

  const generateItinerary = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/generate-itinerary", {
        description,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setItinerary(data.itinerary);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      generateItinerary.mutate(description);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "bg-orange-100 text-orange-800",
      activity: "bg-blue-100 text-blue-800",
      transport: "bg-green-100 text-green-800",
      accommodation: "bg-purple-100 text-purple-800",
      shopping: "bg-pink-100 text-pink-800",
      sightseeing: "bg-yellow-100 text-yellow-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Travel Itinerary Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your dream trip and let AI create a personalized day-by-day itinerary for you
          </p>
        </div>

        {/* Input Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Describe Your Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Tell me about your ideal trip... Where do you want to go? How long? What's your budget? What do you like to do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={generateItinerary.isPending}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!description.trim() || generateItinerary.isPending}
              >
                {generateItinerary.isPending ? "Generating..." : "Generate Itinerary"}
              </Button>
            </form>
            
            {generateItinerary.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  {generateItinerary.error instanceof Error 
                    ? generateItinerary.error.message 
                    : "Failed to generate itinerary. Please try again."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Itinerary */}
        {itinerary && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {itinerary.destination}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{itinerary.totalBudget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Personalized</span>
                  </div>
                </div>
                <p className="text-gray-700">{itinerary.overview}</p>
              </CardContent>
            </Card>

            {/* Daily Itinerary */}
            {itinerary.days.map((day) => (
              <Card key={day.day}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Day {day.day} - {day.date}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {day.totalCost}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {day.activities.map((activity, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">{activity.time}</span>
                            <Badge className={getCategoryColor(activity.category)}>
                              {activity.category}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {activity.cost}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {activity.activity}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-700">{activity.description}</p>
                        )}
                        {index < day.activities.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}