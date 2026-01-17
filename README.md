# Grokathan - X.AI Grok API Integration

A clean, production-ready Python client for interacting with X.AI's Grok API.

## Features

- ✅ Secure API key management via environment variables
- ✅ Clean, modular code structure
- ✅ Comprehensive error handling
- ✅ Easy to extend and customize
- ✅ Type hints and documentation
- ✅ Ready for GitHub collaboration

## Prerequisites

- Python 3.7 or higher
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

### Using in Your Code

```python
from test_api import call_grok_api

# Simple conversation
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello! How are you?"}
]

response = call_grok_api(messages)
print(response['choices'][0]['message']['content'])
```

### Advanced Usage

```python
from test_api import call_grok_api

# Custom parameters
messages = [
    {"role": "user", "content": "Write a haiku about coding"}
]

response = call_grok_api(
    messages=messages,
    model="grok-4-latest",
    temperature=0.7,  # More creative responses
    stream=False
)
```

## Project Structure

```
Grokathan/
├── .env.example          # Template for environment variables
├── .gitignore           # Git ignore rules
├── config.json          # API configuration (no secrets)
├── requirements.txt     # Python dependencies
├── test_api.py         # Main API client and test script
└── README.md           # This file
```

## Configuration

The `config.json` file contains API endpoint configuration:

```json
{
  "project": "Grokathan",
  "description": "X.AI Grok API Integration",
  "api_base": "https://api.x.ai/v1",
  "endpoints": {
    "chat_completions": "/chat/completions"
  },
  "default_model": "grok-4-latest",
  "default_temperature": 0,
  "default_stream": false
}
```

## API Reference

### `call_grok_api(messages, model, temperature, stream)`

Main function to call the Grok API.

**Parameters:**
- `messages` (list): List of message dictionaries with 'role' and 'content'
- `model` (str, optional): Model to use. Default: "grok-4-latest"
- `temperature` (float, optional): Temperature for response creativity (0-1). Default: 0
- `stream` (bool, optional): Whether to stream the response. Default: False

**Returns:**
- dict: API response containing choices, usage info, etc.

**Raises:**
- `ValueError`: If API key is not found in environment
- `Exception`: If API request fails

## Security Notes

⚠️ **Important**: Never commit your `.env` file or expose your API key publicly!

- The `.env` file is automatically ignored by git
- Use `.env.example` as a template for others
- API keys should only be stored in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### "XAI_API_KEY not found in environment variables"
- Make sure you created a `.env` file based on `.env.example`
- Verify your API key is correctly set in the `.env` file
- Check that `python-dotenv` is installed: `pip install python-dotenv`

### API Error 401: Unauthorized
- Verify your API key is valid and active
- Check that the API key in `.env` is correct

### API Error 429: Rate Limited
- You've exceeded the rate limit for your API key
- Wait a moment and try again
- Consider implementing rate limiting in your code

## License

MIT License - feel free to use this project for any purpose.

## Links

- [X.AI API Documentation](https://docs.x.ai/api)
- [Grok Models](https://docs.x.ai/docs)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the [X.AI documentation](https://docs.x.ai)

---

**Made with ❤️ using X.AI's Grok API**
 


