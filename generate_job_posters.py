"""
Job Poster Generator - Creates visually consistent 16:9 posters for X job postings using Grok Imagine
"""
import os
import re
import requests
from pathlib import Path
from xai_sdk import Client
from dotenv import load_dotenv
import json

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

# Initialize xAI client
xai_client = Client(api_key=os.environ.get("XAI_API_KEY"))

# Initialize X API bearer token
x_bearer_token = os.environ.get("X_BEARER_TOKEN")
from urllib.parse import unquote
x_bearer_token = unquote(x_bearer_token) if x_bearer_token else None

# Output folder for generated posters
OUTPUT_FOLDER = Path(__file__).parent / "job_posters"
OUTPUT_FOLDER.mkdir(exist_ok=True)

# Visual-only poster template (NO TEXT)
VISUAL_POSTER_STYLE = """
Create a professional 16:9 landscape poster (1792x1008 pixels) that visually represents a job opportunity.

IMPORTANT: NO TEXT OR WORDS should appear in the image - purely visual storytelling.

Job Type: {job_type}

Visual Description:
{visual_description}

Key Visual Elements to Include:
{key_elements}

Style Guidelines:
- DARK THEME: Use dark, moody colors that blend seamlessly with black backgrounds
- Deep blacks, dark blues, purples, and rich shadows
- Dramatic lighting with subtle highlights and glows
- AESTHETIC: Cinematic composition, visually stunning and artistic
- REALISTIC: Photorealistic rendering, high detail textures, 3D rendered quality
- Professional and polished look
- High resolution (8K quality) with sharp details
- No photographs of people
- No text, labels, or typography anywhere in the image
- Focus on iconic imagery that instantly communicates the job nature
- Atmospheric lighting with rim lights and ambient glow effects
- Color palette should be dark and sophisticated (blacks, deep blues, dark purples, subtle neon accents)
"""

def create_job_poster_prompt(job_data: dict) -> str:
    """
    Create a purely visual prompt using Grok's analysis of the job
    NO TEXT will appear in the generated image
    """
    tweet_text = job_data['text']
    
    # Analyze job with Grok
    analysis = analyze_job_with_grok(tweet_text)
    
    # Format key elements as a list
    key_elements_text = '\n'.join([f"- {elem}" for elem in analysis.get('key_elements', [])])
    
    # Create visual-only prompt
    prompt = VISUAL_POSTER_STYLE.format(
        job_type=analysis.get('job_type', 'job opportunity'),
        visual_description=analysis.get('visual_description', ''),
        key_elements=key_elements_text
    )
    
    # Store analysis in job_data for metadata
    job_data['grok_analysis'] = analysis
    
    return prompt.strip()

def analyze_job_with_grok(tweet_text: str) -> dict:
    """
    Use Grok to analyze what the job is about and generate visual description
    """
    print(f"🤖 Analyzing job with Grok...")
    
    analysis_prompt = f"""
Analyze this job posting tweet and describe what visual imagery would best represent it.
Do NOT include any text in the description - only visual elements.

Tweet: "{tweet_text}"

Provide a JSON response with:
1. "job_type": What kind of job/work is this? (e.g., "minecraft server development", "web development", "graphic design")
2. "visual_description": Detailed description of visual elements that represent this job being done and or in progress (NO TEXT, only imagery)
3. "key_elements": List of 3-5 specific visual elements to include

Example for a Minecraft server job:
{{
  "job_type": "Minecraft server development",
  "visual_description": "Minecraft server development using JAVA programming, featuring iconic Minecraft blocks and pixelated landscapes. A diamond pickaxe striking blocks, with server towers and redstone circuits in the background, symbolizing server architecture and game mechanics.",
  "key_elements": ["minecraft blocks", "pixelated landscape", "diamond pickaxe", "server towers", "redstone circuits"]
}}

Respond only with valid JSON.
"""
    
    try:
        response = xai_client.chat.completions.create(
            model="grok-2-latest",
            messages=[{"role": "user", "content": analysis_prompt}]
        )
        
        analysis_text = response.choices[0].message.content
        print(f"📊 Grok analysis: {analysis_text[:200]}...")
        
        # Parse JSON response
        analysis = json.loads(analysis_text)
        return analysis
        
    except Exception as e:
        print(f"⚠️ Error analyzing with Grok: {e}")
        
        # Try direct requests to xAI API
        try:
            import requests
            response = requests.post(
                'https://api.x.ai/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {os.environ.get("XAI_API_KEY")}'
                },
                json={
                    'model': 'grok-2-latest',
                    'messages': [{'role': 'user', 'content': analysis_prompt}]
                }
            )
            response.raise_for_status()
            
            analysis_text = response.json()['choices'][0]['message']['content']
            print(f"📊 Grok analysis: {analysis_text[:200]}...")
            
            # Remove markdown code blocks if present
            if '```json' in analysis_text:
                analysis_text = analysis_text.split('```json')[1].split('```')[0].strip()
            elif '```' in analysis_text:
                analysis_text = analysis_text.split('```')[1].split('```')[0].strip()
            
            analysis = json.loads(analysis_text)
            return analysis
            
        except Exception as e2:
            print(f"⚠️ Fallback also failed: {e2}")
            # Fallback to basic analysis
            return {
                "job_type": "technology job",
                "visual_description": "Modern technology workspace with code, digital elements, and innovation symbols",
                "key_elements": ["code symbols", "digital interface", "tech icons"]
            }

def extract_tweet_id(url: str) -> str:
    """Extract tweet ID from X/Twitter URL"""
    match = re.search(r'status/(\d+)', url)
    return match.group(1) if match else None

def fetch_tweet_content(tweet_url: str) -> dict:
    """
    Fetch actual tweet content from X API
    """
    tweet_id = extract_tweet_id(tweet_url)
    
    if not tweet_id:
        print("❌ Could not extract tweet ID from URL")
        return None
    
    try:
        print(f"📡 Fetching tweet {tweet_id} from X API...")
        
        # Use X API v2 with bearer token
        headers = {
            'Authorization': f'Bearer {x_bearer_token}'
        }
        
        url = f'https://api.x.com/2/tweets/{tweet_id}'
        params = {
            'tweet.fields': 'text,created_at,author_id',
            'expansions': 'author_id',
            'user.fields': 'username,name'
        }
        
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        tweet_text = data['data']['text']
        author_username = data['includes']['users'][0]['username']
        
        print(f"✅ Tweet fetched: {tweet_text[:100]}...")
        
        # Parse job details from tweet text
        return {
            'id': tweet_id,
            'text': tweet_text,
            'author': author_username,
            'url': tweet_url
        }
        
    except Exception as e:
        print(f"❌ Error fetching tweet: {e}")
        print("Using fallback dummy data...")
        
        # Fallback to dummy data
        return {
            'id': tweet_id,
            'text': 'Need someone to designa poster for a hackathon',
            'author': 'unknown',
            'url': tweet_url
        }

def generate_job_poster(job_data: dict) -> str:
    """
    Generate a 16:9 landscape poster for a job posting using Grok Imagine
    Returns the image URL
    """
    print(f"\n{'='*80}")
    print(f"🎨 Generating poster for tweet: {job_data['text'][:80]}...")
    print(f"{'='*80}")
    
    # Create consistent prompt
    prompt = create_job_poster_prompt(job_data)
    print(f"📝 Prompt: {prompt[:200]}...\n")
    
    try:
        # Generate image using xAI SDK
        response = xai_client.image.sample(
            model="grok-imagine-image-a1",
            prompt=prompt
        )
        
        # Extract URL from ImageResponse
        image_url = response.url
        print(f"✅ Generated poster URL: {image_url}")
        return image_url
            
    except Exception as e:
        print(f"❌ Error generating poster: {e}")
        import traceback
        traceback.print_exc()
        return None

def download_poster(image_url: str, job_data: dict) -> Path:
    """
    Download generated poster and save to job_posters folder
    """
    try:
        # Create filename from tweet ID and first words
        first_words = '_'.join(job_data['text'].split()[:3]).lower()
        safe_name = re.sub(r'[^\w\s-]', '', first_words)
        safe_name = re.sub(r'[-\s]+', '_', safe_name)
        filename = f"{job_data['id']}_{safe_name}.jpg"
        filepath = OUTPUT_FOLDER / filename
        
        print(f"💾 Downloading poster to: {filepath}")
        
        # Download image
        response = requests.get(image_url)
        response.raise_for_status()
        
        # Save to file
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Saved poster: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"❌ Error downloading poster: {e}")
        return None

def process_job_posting(tweet_url: str):
    """
    Complete pipeline: fetch tweet → generate poster → download
    """
    print(f"\n{'#'*80}")
    print(f"# Processing job posting: {tweet_url}")
    print(f"{'#'*80}")
    
    # Fetch tweet content
    job_data = fetch_tweet_content(tweet_url)
    
    # Generate poster
    image_url = generate_job_poster(job_data)
    
    if image_url:
        # Download and save
        filepath = download_poster(image_url, job_data)
        
        if filepath:
            # Save metadata
            metadata_file = filepath.with_suffix('.json')
            with open(metadata_file, 'w') as f:
                json.dump({
                    'job_data': job_data,
                    'image_url': image_url,
                    'poster_path': str(filepath)
                }, f, indent=2)
            
            print(f"\n🎉 Success! Poster saved to: {filepath}")
            print(f"📄 Metadata saved to: {metadata_file}")
            return filepath
    
    return None

if __name__ == "__main__":
    print("=" * 80)
    print("JOB POSTER GENERATOR - Grok Imagine Edition")
    print("=" * 80)
    
    # Test URLs
    test_urls = [
        "https://x.com/eowyn_24_/status/2012534789954314422?s=20",
        # Add more URLs here
    ]
    
    results = []
    
    for url in test_urls:
        result = process_job_posting(url)
        results.append({
            'url': url,
            'success': result is not None,
            'poster_path': str(result) if result else None
        })
    
    # Summary
    print("\n" + "=" * 80)
    print("GENERATION SUMMARY")
    print("=" * 80)
    
    successful = sum(1 for r in results if r['success'])
    print(f"✅ Successfully generated: {successful}/{len(results)} posters")
    print(f"📁 Posters saved in: {OUTPUT_FOLDER}")
    
    for i, result in enumerate(results, 1):
        status = "✅" if result['success'] else "❌"
        print(f"{status} {i}. {result['url']}")
        if result['poster_path']:
            print(f"   → {result['poster_path']}")
