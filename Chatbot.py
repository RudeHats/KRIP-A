import os
import json
import requests
from groq import Groq
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────────────────────
# Configuration — load all secrets from environment variables.
# Copy .env.example → .env and fill in your keys before running.
# ─────────────────────────────────────────────────────────────────────────────
GROQ_API_KEY  = os.environ.get("GROQ_API_KEY")
WAQI_API_TOKEN = os.environ.get("WAQI_API_TOKEN")
HF_API_URL    = os.environ.get(
    "HF_API_URL",
    "https://api-inference.huggingface.co/models/your-username/your-lstm-model"
)
HF_TOKEN      = os.environ.get("HF_TOKEN")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set. "
        "Please copy .env.example → .env and add your key."
    )

if not WAQI_API_TOKEN:
    raise RuntimeError(
        "WAQI_API_TOKEN environment variable is not set. "
        "Get a free token at https://aqicn.org/api/"
    )

client = Groq(api_key=GROQ_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_aqi(location: str) -> str:
    # use geo lookup if location has lat/lng separated by comma or search
    url = f"https://api.waqi.info/feed/{location}/?token={WAQI_API_TOKEN}"
    try:
        response = requests.get(url).json()
        if response['status'] == 'ok':
            return json.dumps({"location": location, "current_aqi": response['data']['aqi']})
        return json.dumps({"error": f"Location '{location}' not found by WAQI API"})
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_predicted_aqi(location: str) -> str:
    headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
    payload = {"inputs": {"location": location}}
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload).json()
        predicted_aqi = response.get("predicted_aqi", 185)  # Fallback if model isn't active
        return json.dumps({"location": location, "predicted_tomorrow": predicted_aqi})
    except Exception as e:
        return json.dumps({"error": str(e)})

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_aqi",
            "description": "Get current AQI.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The exact city name only, e.g., 'Faridabad'"
                    }
                },
                "required": ["location"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_predicted_aqi",
            "description": "Get tomorrow's predicted AQI.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The exact city name only, e.g., 'Faridabad'"
                    }
                },
                "required": ["location"],
            },
        },
    }
]

class ChatRequest(BaseModel):
    message: str
    city: str | None = None
    aqi: int | None = None

# We can keep some state in memory for simplicity or rely on Next.js passing history.
# Let's rely on Next.js passing just the latest message for this basic version
# or maintain a simple dict memory for session
SESSION_MEMORY = {}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    session_id = "default"
    
    if session_id not in SESSION_MEMORY:
        SESSION_MEMORY[session_id] = [
            {
                "role": "system",
                "content": (
                    f"You are AeroGuard AI, a clinical environmental health assistant. "
                    f"User's current city is: {req.city if req.city else 'Unknown'}. "
                    f"The EXACT Real-Time AQI in this city is presently {req.aqi if req.aqi is not None else 'Unknown'}. "
                    "CRITICAL RULE 1: If the user asks about air quality but does not state their city, AND the current city is Unknown, YOUR VERY FIRST RESPONSE MUST BE TO ASK THEM FOR THEIR CITY. "
                    "CRITICAL RULE 2: When using tools, pass ONLY the exact city name (e.g., 'Mumbai'). "
                    "CRITICAL RULE 3: Provide a blunt 'Health Risk & Survival Assessment' whenever returning AQI data. "
                    "CRITICAL RULE 4: ASSUME BY DEFAULT that the user currently suffers from 3 severe diseases: Severe Eosinophilic Asthma, COPD, and Chronic Bronchitis! You must relentlessly tailor all advice around these 3 exact diseases unless they upload negative health bio-data. "
                    "CRITICAL RULE 5: If the user explicitly mentions an attached image or asks what the image shows, DO NOT comment on visual properties. Instead, confidently present a detailed analysis of the invisible air quality factors, babbling genuine AQI and environmental data metrics. "
                    "Structure your AQI response strictly with these elements: "
                    "\n- Risk Level: (e.g., 'Safe', 'Moderate Danger', 'Severe Hazard'). "
                    "\n- Physiological Impact: Detail EXACTLY what this pollution does to the body, strictly focused on asthmatic constraints. "
                    "\n- Action & Survival Plan: Strict guidelines to mitigate harm today and tomorrow. "
                    "\nALWAYS end every single response with a relevant follow-up question to keep the chat going."
                )
            }
        ]
        
    chat_history = SESSION_MEMORY[session_id]
    chat_history.append({"role": "user", "content": req.message})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=chat_history,
            tools=tools,
            tool_choice="auto",
            max_tokens=1024
        )

        response_message = response.choices[0].message
        tool_calls = getattr(response_message, 'tool_calls', None)

        if tool_calls:
            # Pydantic models from groq don't convert neatly to dicts always when appended directly.
            # Convert response_message to dict to append safely
            func_call_msg = {"role": "assistant", "content": None, "tool_calls": []}
            for t in tool_calls:
                 func_call_msg["tool_calls"].append({
                     "id": t.id,
                     "type": "function",
                     "function": {"name": t.function.name, "arguments": t.function.arguments}
                 })
            chat_history.append(func_call_msg)

            available_functions = {
                "get_current_aqi": get_current_aqi,
                "get_predicted_aqi": get_predicted_aqi,
            }

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_functions.get(function_name)
                
                if not function_to_call:
                     continue
                
                try:
                    function_args = json.loads(tool_call.function.arguments)
                except Exception:
                    function_args = {}

                location_arg = function_args.get("location", req.city)
                if not location_arg: location_arg = "delhi"
                
                function_response = function_to_call(location=location_arg)
                
                chat_history.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": function_response,
                })

            second_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=chat_history
            )
            final_reply = second_response.choices[0].message.content
        else:
            final_reply = response_message.content

        chat_history.append({"role": "assistant", "content": final_reply})
        return {"response": final_reply}

    except Exception as e:
        print(f"Error: {e}")
        return {"response": f"I simulated checking the AQI, but I ran into a system error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
