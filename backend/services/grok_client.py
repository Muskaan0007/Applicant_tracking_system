"""
services/grok_client.py
Wrapper around the Groq API (free tier).
"""
import requests
import json
from django.conf import settings

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"  # Available on free Groq account


def chat(messages: list, temperature: float = 0.2) -> str:
    """
    Send messages to Groq and return the assistant reply text.
    Same function signature as before — nothing else in the project changes.
    """
    api_key = settings.GROQ_API_KEY
    
    if not api_key or api_key.strip() == '':
        raise ValueError("GROQ_API_KEY is not set in environment variables")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1500,
    }

    print(f"[Groq] Sending request...")
    print(f"[Groq] Model: {MODEL}")
    print(f"[Groq] API Key loaded: {bool(api_key)}")
    print(f"[Groq] Key starts with: {api_key[:10] if api_key else 'NONE'}...")
    print(f"[Groq] Endpoint: {GROQ_API_URL}")
    print(f"[Groq] Messages count: {len(messages)}")
    print(f"[Groq] Message roles: {[m.get('role') for m in messages]}")

    try:
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        print(f"[Groq] Status: {response.status_code}")

        if response.status_code != 200:
            error_body = response.text
            print(f"[Groq] Full error response: {error_body}")
            try:
                error_json = response.json()
                print(f"[Groq] Parsed error: {json.dumps(error_json, indent=2)}")
            except:
                pass
            print(f"[Groq] Request payload summary: model={payload['model']}, messages={len(payload['messages'])}, max_tokens={payload['max_tokens']}")
            response.raise_for_status()

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        print(f"[Groq] Reply: {content[:80]}...")
        return content

    except requests.exceptions.Timeout:
        print("[Groq] Request timed out")
        raise
    except Exception as e:
        print(f"[Groq] Error: {e}")
        raise