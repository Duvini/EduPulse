# EduPulse AI Learning Assistant Setup

This document provides instructions for setting up and using the AI Learning Assistant feature in your EduPulse application.

## Backend Configuration

The AI Learning Assistant backend is already configured to use the OpenAI API. To make it work with real responses instead of mock data, you need to set up an environment variable:

1. Create a `.env` file in the root directory of your EduPulseBackend project:

```
OPENAI_API_KEY=your_actual_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

2. When running the application, ensure these environment variables are available.

## Getting an OpenAI API Key

To get an OpenAI API key:

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Navigate to the [API keys section](https://platform.openai.com/api-keys)
3. Create a new API key
4. Copy the key (you'll only see it once)
5. Add it to your environment variables as shown above

## Development Setup

For development, you can set the API key directly:

### On macOS:

```bash
export OPENAI_API_KEY=your_actual_openai_api_key_here
```

Then run your Spring Boot application:

```bash
cd EduPulseBackend
./mvnw spring-boot:run
```

### For Production Deployment

For production environments, ensure the environment variable is properly set in your deployment configuration.

## Using the AI Learning Assistant

Once configured:

1. Log in to the EduPulse application
2. Navigate to the "AI Assistant" tab from the navigation menu
3. Start asking questions about your learning materials
4. You can relate conversations to specific learning plans
5. Share helpful AI conversations with other users by making them public

## Troubleshooting

If you're still seeing the mock response message:

- Verify your OpenAI API key is correct and has sufficient credits
- Check your application logs for any API-related errors
- Ensure the API key environment variable is properly set
- Restart the backend application after setting the environment variable

## Feature Limitations

- The AI Assistant is designed to help with educational content relevant to your learning plans
- Responses are based on the information available to the language model
- Custom training on specific course materials is not implemented in this version

## Future Enhancements

Planned enhancements for future versions:
- Direct integration with learning plan materials
- Ability to upload documents for the AI to reference
- Enhanced code highlighting and formatting
- Specialized knowledge based on educational domains