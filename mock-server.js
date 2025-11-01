const http = require('http');
const url = require('url');

// Mock data
const suggestedPrompts = [
  { id: '1', text: 'What are the latest trends in artificial intelligence?', category: 'Technology', icon: '🤖' },
  { id: '2', text: 'Explain machine learning in simple terms', category: 'Education', icon: '📚' },
  { id: '3', text: 'How can I improve my productivity?', category: 'Productivity', icon: '⚡' },
  { id: '4', text: 'What are some healthy breakfast recipes?', category: 'Health', icon: '🥗' },
  { id: '5', text: 'Explain the basics of quantum computing', category: 'Science', icon: '⚛️' },
  { id: '6', text: 'How do I start learning web development?', category: 'Programming', icon: '💻' }
];

// Sample responses based on keywords
function generateResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
    return {
      content: "Artificial Intelligence is a rapidly evolving field that encompasses machine learning, neural networks, and natural language processing. Recent trends include generative AI, large language models, and AI ethics considerations. The field is seeing breakthrough applications in healthcare, finance, and creative industries.",
      citations: [
        {
          id: '1',
          title: 'Advances in Artificial Intelligence: 2024 Report',
          url: 'https://example.com/ai-report',
          snippet: 'AI continues to transform industries with unprecedented capabilities in reasoning and generation.'
        },
        {
          id: '2',
          title: 'Machine Learning Fundamentals',
          url: 'https://example.com/ml-fundamentals',
          snippet: 'Understanding the core concepts of ML algorithms and their practical applications.'
        }
      ],
      confidence: 0.92,
      followUpActions: [
        { id: '1', label: 'Tell me about machine learning', action: 'expand', prompt: 'Explain machine learning in detail' },
        { id: '2', label: 'What about AI ethics?', action: 'ask_followup', prompt: 'What are the ethical considerations in AI development?' }
      ]
    };
  }
  
  if (lowerMessage.includes('productivity')) {
    return {
      content: "Improving productivity involves several key strategies: time management techniques like the Pomodoro method, minimizing distractions, using productivity tools effectively, prioritizing tasks with frameworks like Eisenhower Matrix, and maintaining good physical and mental health. Regular breaks and adequate sleep are crucial for sustained productivity.",
      citations: [
        {
          id: '3',
          title: 'The Science of Productivity',
          url: 'https://example.com/productivity-science',
          snippet: 'Research-backed methods to enhance focus and output in professional environments.'
        }
      ],
      confidence: 0.88,
      followUpActions: [
        { id: '3', label: 'Time management techniques', action: 'expand', prompt: 'What are the best time management techniques?' },
        { id: '4', label: 'Productivity tools', action: 'ask_followup', prompt: 'What tools can help with productivity?' }
      ]
    };
  }
  
  if (lowerMessage.includes('web development') || lowerMessage.includes('programming')) {
    return {
      content: "Starting web development involves learning HTML, CSS, and JavaScript fundamentals. Begin with responsive design principles, then move to modern frameworks like React or Vue. Practice through projects, contribute to open source, and build a portfolio. Resources include freeCodeCamp, MDN Web Docs, and online platforms like Codecademy.",
      citations: [
        {
          id: '4',
          title: 'Web Development Roadmap 2024',
          url: 'https://example.com/web-dev-roadmap',
          snippet: 'Comprehensive guide to becoming a web developer from scratch.'
        }
      ],
      confidence: 0.95,
      followUpActions: [
        { id: '5', label: 'Best learning resources', action: 'expand', prompt: 'What are the best resources for learning web development?' },
        { id: '6', label: 'Build first project', action: 'ask_followup', prompt: 'What should be my first web development project?' }
      ]
    };
  }
  
  // Default response
  return {
    content: "That's an interesting question! Based on current information, I can provide some insights on this topic. The answer depends on various factors including context, specific requirements, and current best practices. Would you like me to elaborate on any particular aspect of your question?",
    citations: [
      {
        id: '5',
        title: 'General Knowledge Base',
        url: 'https://example.com/knowledge',
        snippet: 'Comprehensive information covering various topics and subjects.'
      }
    ],
    confidence: 0.75,
    followUpActions: [
      { id: '7', label: 'Elaborate further', action: 'expand', prompt: 'Can you provide more detailed information?' },
      { id: '8', label: 'Related topics', action: 'ask_followup', prompt: 'What are some related topics I should know about?' }
    ]
  };
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (path === '/api/ai/suggestions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(suggestedPrompts));
    return;
  }
  
  if (path === '/api/ai/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        const response = generateResponse(message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  if (path === '/api/ai/chat/stream' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        const response = generateResponse(message);
        
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        
        // Simulate streaming by sending chunks
        const words = response.content.split(' ');
        let chunkIndex = 0;
        
        const interval = setInterval(() => {
          if (chunkIndex < words.length) {
            const chunk = words[chunkIndex] + ' ';
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            chunkIndex++;
          } else {
            // Send metadata and finish
            if (response.citations || response.confidence || response.followUpActions) {
              res.write(`data: ${JSON.stringify({
                citations: response.citations,
                confidence: response.confidence,
                followUpActions: response.followUpActions
              })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            clearInterval(interval);
            res.end();
          }
        }, 50); // Send a word every 50ms
        
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Mock AI server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/ai/suggestions');
  console.log('  POST /api/ai/chat');
  console.log('  POST /api/ai/chat/stream');
});