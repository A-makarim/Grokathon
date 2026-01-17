## This is Grokathon!

# Grokathan - X.AI Grok API Integration

- X.AI API key ([Get one here](https://x.ai/api))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Grokathan.git
   cd Grokathan
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your API key**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your X.AI API key:
   ```
   XAI_API_KEY=your_actual_api_key_here
   XAI_API_BASE=https://api.x.ai/v1
   ```

## Usage

### Basic Usage

Run the test script:
```bash
python test_api.py
```
