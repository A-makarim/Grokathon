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

# Realistic job visualization template
REALISTIC_JOB_POSTER_STYLE = """
Create a photorealistic 16:9 landscape poster (1792x1008 pixels) showing exactly what this job entails.

Job Type: {job_type}

CENTERED TEXT (place prominently in center of image):
"{job_title_sentence}"

Scene Description:
{scene_description}

Visual Elements (make these prominent and clear):
{visual_elements}

Color Scheme:
{color_scheme}

COMPOSITION REQUIREMENTS:
- The job description text MUST be centered vertically and horizontally with equal spacing and highly visible
- Use clean, bold, professional sans-serif font for the text
- Text should have subtle glow or shadow for readability against dark background
- Text size should be large enough to read clearly (main focal point)
- Text should have a a lot of drop shadow (BLACK) to stand out from background and darken the background behind the text

STYLE REQUIREMENTS:
- PHOTOREALISTIC: Looks like a real photograph or cinema-quality 3D render
- Show actual workspace, tools, equipment that make the job immediately recognizable
- ULTRA DARK THEME: Background must be extremely dark, almost pure black (#000000 to #0a0a0a)
- Only light sources should be screens, LEDs, or small desk lamps creating minimal illumination
- 90% of the image should be in deep shadow with only key elements subtly lit
- Dramatic cinematic lighting with practical sources (screens, LEDs, desk lamps) - keep these dim
- Very high contrast between the few lit areas and the dominant dark shadows
- Background areas not lit by screens/lights should be pure black or near-black
- Color palette: {color_scheme} but keep overall brightness very low
- Professional and polished aesthetic with moody, nighttime atmosphere
- 8K quality, sharp details, realistic textures
- The scene should clearly communicate what the job is, even without text
- Atmospheric effects: very subtle light rays, minimal screen glow, dark ambient lighting
- Composition should be balanced with text centered as the hero element
- Text should have a lot of drop shadow (BLACK) to stand out from background and darken the background behind the text
- Overall image luminosity should be very low - think dimly lit room at night

"""

def create_job_poster_prompt(job_data: dict) -> str:
    """
    Create a realistic prompt with explicit centered job description
    Image will clearly show the job even if tweet is vague
    """
    tweet_text = job_data['text']
    
    # Analyze job with Grok
    analysis = analyze_job_with_grok(tweet_text)
    
    # Format visual elements as a list
    visual_elements_text = '\n'.join([f"- {elem}" for elem in analysis.get('visual_elements', [])])
    
    # Create realistic job scene prompt
    prompt = REALISTIC_JOB_POSTER_STYLE.format(
        job_type=analysis.get('job_type', 'Professional Opportunity'),
        job_title_sentence=analysis.get('job_title_sentence', 'Exciting job opportunity available'),
        scene_description=analysis.get('scene_description', 'professional workspace with modern equipment'),
        visual_elements=visual_elements_text,
        color_scheme=analysis.get('color_scheme', 'deep blacks with subtle blue accents')
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
Analyze this job posting tweet and create a clear, explicit description for a job poster image.
Even if the tweet is vague, you should make the job clear and specific in your description.

Tweet: "{tweet_text}"

Provide a JSON response with:
1. "job_type": What kind of job/work is this? (be specific)
2. "job_title_sentence": A clear sentence that explicitly states what the job is (8-12 words, will be centered on image)
   Example: "Looking for an experienced developer to build a Minecraft server"
   Example: "Seeking a graphic designer to create hackathon promotional materials"
3. "scene_description": A realistic, detailed scene showing what this job work environment looks like
4. "visual_elements": List of 5-7 specific realistic elements that make the job instantly recognizable
5. "color_scheme": Specific dark colors to use (e.g., "deep blue and purple with cyan accents")

Example for a Minecraft server job:
{{
  "job_type": "Minecraft Server Developer",
  "job_title_sentence": "Build a high-performance Minecraft server for 100 players",
  "scene_description": "Professional gaming setup with ultra-wide monitors displaying Minecraft server console, command terminals with server stats, glowing mechanical keyboard, server rack visible in background with blue LED indicators, Minecraft world rendering on main screen, dark room with RGB ambient lighting",
  "visual_elements": ["Minecraft server dashboard", "command line interface", "performance graphs", "server rack with lights", "gaming peripherals", "multiple monitors", "code editor with server configs"],
  "color_scheme": "deep blacks with cyan and green terminal glow"
}}

IMPORTANT: Make the job_title_sentence very clear and specific. If the tweet is vague, infer the most likely job description.

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
            'text': 'Need someone to teach A levels physics',
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
