import os
import requests
from dotenv import load_dotenv

load_dotenv()

def check_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    try:
        res = requests.post(url, json={"contents": [{"parts": [{"text": "Hello"}]}]})
        return res.status_code == 200
    except:
        return False

def check_openrouter():
    api_key = os.getenv("OPENROUTER_API_KEY")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        res = requests.post(url, headers=headers, json={"model": "google/gemma-2-9b-it:free", "messages": [{"role": "user", "content": "Hello"}]})
        return res.status_code == 200
    except:
        return False

def check_groq():
    api_key = os.getenv("GROQ_API_KEY")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        res = requests.post(url, headers=headers, json={"model": "llama3-8b-8192", "messages": [{"role": "user", "content": "Hello"}]})
        return res.status_code == 200
    except:
        return False

print("Gemini:", check_gemini())
print("OpenRouter:", check_openrouter())
print("Groq:", check_groq())
