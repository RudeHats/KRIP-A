"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ImagePlus, X, MessageCircle, Minimize2, Loader2 } from "lucide-react";
import { AQICharacter } from "./aqi-character";
import { getAQIColor, getAQICategory } from "@/lib/aqi-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface AQIChatbotProps {
  aqi: number;
  city: string;
}

// Smart response generation based on AQI context
function generateResponse(userMessage: string, aqi: number, city: string): string {
  const category = getAQICategory(aqi);
  const lowerMessage = userMessage.toLowerCase();
  
  // Health recommendations
  if (lowerMessage.includes("health") || lowerMessage.includes("safe") || lowerMessage.includes("advice") || lowerMessage.includes("recommend")) {
    if (aqi <= 50) {
      return `Great news! With the current AQI of ${aqi} in ${city}, air quality is excellent. It's a perfect day for outdoor activities. Enjoy your time outside!`;
    } else if (aqi <= 100) {
      return `The air quality in ${city} is moderate at ${aqi}. Most people can enjoy outdoor activities, but unusually sensitive individuals may want to limit prolonged outdoor exertion.`;
    } else if (aqi <= 150) {
      return `With an AQI of ${aqi}, sensitive groups (children, elderly, those with respiratory conditions) should reduce prolonged outdoor exertion. Consider wearing an N95 mask if outdoors for extended periods.`;
    } else if (aqi <= 200) {
      return `Air quality is unhealthy at ${aqi}. I recommend limiting outdoor activities, keeping windows closed, and using air purifiers indoors. If you must go outside, wear an N95 mask.`;
    } else if (aqi <= 300) {
      return `The air quality is very unhealthy at ${aqi}. Everyone should avoid outdoor activities. Stay indoors with air purification running, and keep all windows sealed. This is not a day for outdoor exercise.`;
    } else {
      return `HAZARDOUS conditions with AQI at ${aqi}. Please remain indoors, run air purifiers on maximum, seal windows and doors. Only go outside if absolutely necessary with proper N95/P100 respiratory protection.`;
    }
  }
  
  // Exercise/outdoor activities
  if (lowerMessage.includes("exercise") || lowerMessage.includes("run") || lowerMessage.includes("jog") || lowerMessage.includes("outdoor") || lowerMessage.includes("outside")) {
    if (aqi <= 50) {
      return `Perfect conditions for outdoor exercise! The AQI of ${aqi} means clean air. Go enjoy that run or outdoor workout!`;
    } else if (aqi <= 100) {
      return `Outdoor exercise is generally fine with the current AQI of ${aqi}. If you're sensitive to air quality, consider lighter activities or shorter durations.`;
    } else if (aqi <= 150) {
      return `I'd recommend moving your workout indoors today. With an AQI of ${aqi}, intense outdoor exercise could irritate your respiratory system. A gym or home workout would be better.`;
    } else {
      return `Please avoid outdoor exercise today. The AQI of ${aqi} is too high for safe physical activity outside. Indoor workouts are strongly recommended until conditions improve.`;
    }
  }
  
  // Pollutant explanations
  if (lowerMessage.includes("pm2.5") || lowerMessage.includes("pm 2.5") || lowerMessage.includes("particulate")) {
    return `PM2.5 refers to fine particulate matter smaller than 2.5 micrometers - about 30 times smaller than a human hair. These tiny particles can penetrate deep into your lungs and even enter your bloodstream. At the current AQI of ${aqi}, ${aqi > 100 ? "levels are elevated. Consider using an air purifier with a HEPA filter." : "levels are within acceptable range."}`;
  }
  
  if (lowerMessage.includes("ozone") || lowerMessage.includes("o3")) {
    return `Ozone (O3) at ground level is a harmful pollutant created when sunlight reacts with pollutants from cars and industry. It's usually highest on hot, sunny afternoons. With the current conditions in ${city}, ${aqi > 100 ? "ozone levels may be elevated - limit outdoor activities during peak afternoon hours." : "ozone levels should be manageable."}`;
  }
  
  if (lowerMessage.includes("no2") || lowerMessage.includes("nitrogen")) {
    return `Nitrogen dioxide (NO2) primarily comes from vehicle exhaust and power plants. It can inflame airways and worsen respiratory conditions. The current AQI in ${city} is ${aqi}, which means ${aqi > 100 ? "you should limit time in heavy traffic areas." : "NO2 levels are likely within safe bounds."}`;
  }
  
  // Forecast questions
  if (lowerMessage.includes("tomorrow") || lowerMessage.includes("forecast") || lowerMessage.includes("predict") || lowerMessage.includes("better") || lowerMessage.includes("improve")) {
    return `Based on current trends in ${city}, air quality is expected to gradually improve over the next 48 hours. The forecast shows AQI potentially dropping to around ${Math.max(50, aqi - 40)} by tomorrow. Weather conditions like wind and rain can significantly help clear pollutants.`;
  }
  
  // Mask questions
  if (lowerMessage.includes("mask") || lowerMessage.includes("protection") || lowerMessage.includes("n95")) {
    if (aqi <= 100) {
      return `With the current AQI of ${aqi}, masks aren't necessary for most people. However, if you're particularly sensitive to air quality, a simple surgical mask can provide some comfort.`;
    } else {
      return `Yes, I recommend wearing an N95 or KN95 mask outdoors with the current AQI of ${aqi}. Regular cloth or surgical masks don't filter fine particles effectively. Make sure your mask fits snugly without gaps around the edges.`;
    }
  }
  
  // Air purifier questions
  if (lowerMessage.includes("purifier") || lowerMessage.includes("filter") || lowerMessage.includes("indoor")) {
    return `For indoor air quality, I recommend a HEPA air purifier - these can capture 99.97% of particles. ${aqi > 100 ? `With the current AQI of ${aqi}, keep your purifier running continuously and keep windows closed.` : `Even with the current moderate AQI of ${aqi}, running a purifier can help maintain excellent indoor air quality.`}`;
  }
  
  // Children/elderly questions
  if (lowerMessage.includes("child") || lowerMessage.includes("kid") || lowerMessage.includes("elder") || lowerMessage.includes("senior") || lowerMessage.includes("baby")) {
    if (aqi <= 50) {
      return `Children and elderly can safely enjoy outdoor activities with the current excellent air quality (AQI: ${aqi}). It's a great day for the park!`;
    } else if (aqi <= 100) {
      return `Most children and elderly can be outdoors, but watch for any unusual symptoms like coughing or shortness of breath. The moderate AQI of ${aqi} is generally safe for short periods.`;
    } else {
      return `With an AQI of ${aqi}, I recommend keeping children and elderly indoors as much as possible. Their respiratory systems are more vulnerable to air pollution. If they must go outside, keep it brief and consider a fitted mask.`;
    }
  }
  
  // Pet questions  
  if (lowerMessage.includes("pet") || lowerMessage.includes("dog") || lowerMessage.includes("cat")) {
    if (aqi <= 100) {
      return `Pets can safely enjoy outdoor time with the current AQI of ${aqi}. Just provide fresh water and watch for signs of discomfort like excessive panting.`;
    } else {
      return `I recommend keeping pets indoors as much as possible with the current AQI of ${aqi}. Animals, especially flat-faced breeds like bulldogs and Persian cats, are sensitive to air pollution. Quick bathroom breaks only!`;
    }
  }
  
  // Image analysis (simulated)
  if (lowerMessage.includes("image") || lowerMessage.includes("photo") || lowerMessage.includes("picture") || lowerMessage.includes("see")) {
    return `I can see you're interested in visual air quality indicators. Common signs of poor air quality include hazy skies, reduced visibility, and a yellowish or grayish tint to the air. The current AQI of ${aqi} in ${city} corresponds to ${category.label} conditions.`;
  }
  
  // General greeting
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey") || lowerMessage.length < 10) {
    return `Hello! I'm here to help you understand the air quality in ${city}. The current AQI is ${aqi} (${category.label}). What would you like to know? You can ask about health recommendations, outdoor activities, pollutant information, or the forecast.`;
  }
  
  // Default helpful response
  return `The current AQI in ${city} is ${aqi}, which is categorized as "${category.label}". ${
    aqi <= 50 
      ? "Air quality is excellent - perfect for all outdoor activities!" 
      : aqi <= 100 
      ? "Air quality is acceptable, though sensitive individuals should be cautious."
      : aqi <= 150
      ? "Sensitive groups may experience health effects. Consider reducing outdoor exposure."
      : aqi <= 200
      ? "Everyone may begin to experience health effects. Limit outdoor activities."
      : "Health warnings - avoid outdoor activities when possible."
  } Is there something specific you'd like to know about?`;
}

export function AQIChatbot({ aqi, city }: AQIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const color = getAQIColor(aqi);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imagePreview) || isLoading) return;
    
    const messageContent = input.trim() || "What can you tell me about this image related to air quality?";
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      image: imagePreview || undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    setIsLoading(true);
    
    // Simulate typing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const response = generateResponse(messageContent, aqi, city);
    
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  }, [input, imagePreview, isLoading, aqi, city]);
  
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full glass-card transition-all duration-300 hover:scale-110 group"
        style={{ 
          boxShadow: `0 0 20px ${color}40`,
          border: `1px solid ${color}40`,
        }}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6 text-foreground" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-foreground" />
            <span 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </button>
      
      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-500 ${
          isOpen 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
        style={{
          boxShadow: `0 0 40px ${color}20`,
          border: `1px solid ${color}20`,
        }}
      >
        {/* Header */}
        <div 
          className="p-4 flex items-center gap-3 border-b border-border"
          style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)` }}
        >
          <AQICharacter aqi={aqi} size="sm" isTyping={isLoading} />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">AQI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Typing..." : "Ask me about air quality"}
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="animate-fade-in">
              <div className="flex items-start gap-3">
                <AQICharacter aqi={aqi} size="sm" />
                <div 
                  className="glass-card rounded-2xl rounded-tl-sm p-3 max-w-[85%]"
                  style={{ borderColor: `${color}20` }}
                >
                  <p className="text-sm text-foreground">
                    Hello! I&apos;m your AQI assistant. The current air quality in {city} is{" "}
                    <span style={{ color }} className="font-semibold">{aqi}</span>.
                  </p>
                  <p className="text-sm text-foreground mt-2">
                    You can ask me about:
                  </p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>- Health recommendations</li>
                    <li>- Outdoor activity safety</li>
                    <li>- Pollutant explanations</li>
                    <li>- Protection tips (masks, purifiers)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 animate-message-in ${
                  isUser ? "flex-row-reverse" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {!isUser && <AQICharacter aqi={aqi} size="sm" />}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "glass-card rounded-bl-sm"
                  }`}
                  style={!isUser ? { borderColor: `${color}20` } : {}}
                >
                  {/* Show attached image */}
                  {message.image && (
                    <div className="mb-2">
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="rounded-lg max-w-full h-auto max-h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  <p className={`text-sm whitespace-pre-wrap ${isUser ? "" : "text-foreground"}`}>
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-end gap-2 animate-message-in">
              <AQICharacter aqi={aqi} size="sm" isTyping />
              <div 
                className="glass-card rounded-2xl rounded-bl-sm p-3"
                style={{ borderColor: `${color}20` }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 py-2 border-t border-border">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-16 w-auto rounded-lg object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:scale-110 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about air quality..."
              disabled={isLoading}
              className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            
            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !imagePreview)}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
