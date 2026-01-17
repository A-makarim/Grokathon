"""Test script for X.AI Grok API integration."""
import json
import os
from pathlib import Path
import requests
from dotenv import load_dotenv


def load_config():
    """Load API configuration from config file."""
    config_path = Path(__file__).parent / 'config.json'
    with open(config_path, 'r') as f:
        return json.load(f)


def get_api_key():
    """Get API key from environment variables."""
    # Load environment variables from .env file
    load_dotenv()
    
    api_key = os.getenv('XAI_API_KEY')
    if not api_key:
        raise ValueError(
            "XAI_API_KEY not found in environment variables. \n"
            "Please create a .env file based on .env.example and add your API key."
        )
    return api_key


def call_grok_api(messages, model="grok-4-latest", temperature=0, stream=False):
    """Make a request to the Grok API.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content'
        model: Model to use (default: grok-4-latest)
        temperature: Temperature setting (default: 0)
        stream: Whether to stream the response (default: False)
    
    Returns:
        dict: API response as JSON
    """
    config = load_config()
    api_key = get_api_key()
    
    # Build the request
    api_base = os.getenv('XAI_API_BASE', config['api_base'])
    url = f"{api_base}{config['endpoints']['chat_completions']}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    body = {
        "messages": messages,
        "model": model,
        "stream": stream,
        "temperature": temperature
    }
    
    # Make the API call
    print(f"Calling Grok API at {url}...\n")
    response = requests.post(url, headers=headers, json=body)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API Error {response.status_code}: {response.text}")


def main():
    """Main function to test the API."""
    try:
        # Example messages
        messages = [
            {
                "role": "system",
                "content": "You are a test assistant."
            },
            {
                "role": "user",
                "content": "Testing. Just say hi and hello world in capital letters and nothing else."
            }
        ]
        
        # Call the API
        result = call_grok_api(messages)
        
        # Display results
        print("Response:")
        print(json.dumps(result, indent=2))
        
        # Extract the assistant's message
        if 'choices' in result and len(result['choices']) > 0:
            message = result['choices'][0]['message']['content']
            print(f"\n{'='*50}")
            print(f"Assistant says: {message}")
            print(f"{'='*50}")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
