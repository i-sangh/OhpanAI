const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Add specific formatting instructions to the prompt
    const formattedPrompt = `${message}\n\nPlease format the response with clear paragraph breaks using double newlines, use "**" for headers, and maintain a clear structure with proper spacing.`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: formattedPrompt
        }
      ],
      model: "llama-3.2-11b-text-preview",
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    });

    let response = chatCompletion.choices[0]?.message?.content || 'No response';
    
    // Ensure proper spacing and formatting in the response
    response = response
      .split('\n\n')  // Split into paragraphs
      .map(paragraph => paragraph.trim())  // Trim whitespace
      .filter(paragraph => paragraph)  // Remove empty paragraphs
      .join('\n\n');  // Rejoin with double newlines
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});