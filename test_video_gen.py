"""
Test script for xAI Grok Video Generation and Editing API using official xAI SDK
"""
import os
from pathlib import Path
from xai_sdk import Client
from dotenv import load_dotenv

# Load environment variables from .env file in current directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

# Get API key
api_key = os.environ.get("XAI_API_KEY")
print(f"🔑 Loaded from: {env_path}")
print(f"🔑 API Key: {api_key[:20]}...{api_key[-20:] if api_key else 'None'}\n")

# Initialize xAI client
client = Client(api_key=api_key)

def generate_video(prompt: str):
    """
    Generate a video using Grok Imagine Video API
    
    Args:
        prompt: Text description of the video to generate
    """
    print(f"🎬 Generating video with prompt:\n{prompt}\n")
    
    try:
        # Use the xAI SDK's video.generate method
        response = client.video.generate(
            model="grok-imagine-video-beta",
            prompt=prompt
        )
        
        print(f"Response type: {type(response)}")
        print(f"Response: {response}\n")
        
        # Extract video URL
        if hasattr(response, 'videos') and len(response.videos) > 0:
            video_url = response.videos[0].url
            print(f"✅ Success! Video URL:\n{video_url}\n")
            return video_url
        elif hasattr(response, 'url'):
            print(f"✅ Success! Video URL:\n{response.url}\n")
            return response.url
        else:
            print(f"✅ Success! Response:\n{response}\n")
            return response
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

def edit_video(prompt: str, video_url: str):
    """
    Edit an existing video using Grok Imagine Video API
    
    Args:
        prompt: Text description of how to edit the video
        video_url: URL of the video to edit
    """
    print(f"✂️ Editing video with prompt:\n{prompt}\n")
    print(f"📹 Source video: {video_url}\n")
    
    try:
        # Check if there's an edit method or use requests for the API
        import requests
        
        response = requests.post(
            'https://api.x.ai/v1/videos/edits',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'prompt': prompt,
                'video': {'url': video_url},
                'model': 'grok-imagine-video-beta'
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {result}\n")
            
            # Extract video URL from response
            if 'video' in result and 'url' in result['video']:
                edited_url = result['video']['url']
                print(f"✅ Success! Edited video URL:\n{edited_url}\n")
                return edited_url
            else:
                print(f"✅ Success! Response:\n{result}\n")
                return result
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("=" * 80)
    print("TEST 1: Video Generation")
    print("=" * 80)
    
    # Test video generation
    test_prompt = "A majestic dragon flying through clouds at sunset, cinematic lighting, 4K quality"
    video_result = generate_video(test_prompt)
    
    if video_result:
        print("\n" + "=" * 80)
        print("TEST 2: Video Editing")
        print("=" * 80)
        
        # Test video editing with existing video
        edit_prompt = "Make it a winter wonderland with snow falling"
        source_video = "https://vidgen.x.ai/xai-vidgen-bucket/leaderboard/xai-video-154b5591-18b5-4224-a5c4-24d45f5744c8.mp4"
        
        edited_result = edit_video(edit_prompt, source_video)
        
        if edited_result:
            print("\n🎉 Both video generation and editing tests completed successfully!")
        else:
            print("\n⚠️ Video editing test failed.")
    else:
        print("\n⚠️ Video generation test failed.")
