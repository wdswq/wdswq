# AI Assistant Interface

A modern, responsive AI assistant interface built with React and TypeScript, featuring streaming responses, context management, and rich UI components.

## Features

- **Streaming Responses**: Real-time AI response streaming with typing indicators
- **Conversational Context**: Maintains conversation history for multi-turn queries
- **Rich Response Cards**: Displays responses with citations, confidence scores, and follow-up actions
- **Filter Controls**: Domain, time range, source, and confidence filters
- **Suggested Prompts**: Pre-defined questions organized by category
- **Responsive Design**: Mobile-first design that works on all devices
- **Error Handling**: Comprehensive error handling with retry functionality
- **Local Storage**: Persists conversation context across sessions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with CSS variables
- **Icons**: Lucide React
- **State Management**: React hooks with localStorage persistence

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-assistant-interface
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your AI API endpoint:
```
VITE_AI_API_URL=http://localhost:8080/api/ai
```

4. (Optional) Start the mock server for testing:
```bash
node mock-server.js
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Mock Server

For development and testing purposes, a mock server is included (`mock-server.js`) that simulates the AI backend:

```bash
node mock-server.js
```

The mock server provides:
- Realistic AI responses based on keyword matching
- Streaming response simulation
- Sample citations and follow-up actions
- Error handling scenarios

This allows you to test the full frontend functionality without requiring a real AI backend.

## API Integration

The application expects an AI backend with the following endpoints:

### POST `/api/ai/chat`
Standard chat endpoint for non-streaming responses.

**Request:**
```json
{
  "message": "Your question here",
  "context": [
    {
      "role": "user",
      "content": "Previous message"
    }
  ],
  "filters": {
    "domain": "tech",
    "timeRange": "week",
    "source": "academic",
    "confidence": 0.8
  }
}
```

**Response:**
```json
{
  "content": "AI response",
  "citations": [
    {
      "id": "1",
      "title": "Source title",
      "url": "https://example.com",
      "snippet": "Relevant excerpt"
    }
  ],
  "confidence": 0.95,
  "followUpActions": [
    {
      "id": "1",
      "label": "Tell me more",
      "action": "expand",
      "prompt": "Expand on this topic"
    }
  ],
  "isComplete": true
}
```

### POST `/api/ai/chat/stream`
Server-sent events endpoint for streaming responses.

The response should use Server-Sent Events format:
```
data: {"content": "Partial response"}

data: {"citations": [...], "confidence": 0.9}
data: [DONE]
```

### GET `/api/ai/suggestions`
Returns suggested prompts for users.

**Response:**
```json
[
  {
    "id": "1",
    "text": "What are the latest trends in AI?",
    "category": "Technology",
    "icon": "🤖"
  }
]
```

## Component Structure

```
src/
├── components/
│   ├── MessageCard.tsx      # Individual message display
│   ├── QueryBox.tsx         # Input field with send/cancel
│   ├── SuggestedPrompts.tsx # Pre-defined questions
│   ├── FilterControls.tsx   # Search filters UI
│   └── StreamingIndicator.tsx # Connection status
├── hooks/
│   └── useAIAssistant.ts    # Main state management hook
├── services/
│   └── aiService.ts         # API communication layer
├── types/
│   └── index.ts             # TypeScript type definitions
└── App.tsx                  # Main application component
```

## Configuration

### Environment Variables

- `VITE_AI_API_URL`: Base URL for the AI API (default: `http://localhost:8080/api/ai`)
- `VITE_AI_API_KEY`: Optional API key for authentication

### Styling

The application uses CSS variables for theming. You can customize the appearance by modifying the variables in `src/index.css`:

```css
:root {
  --primary-color: #3b82f6;
  --background: #ffffff;
  --text-primary: #1e293b;
  /* ... more variables */
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.