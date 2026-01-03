const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const Groq = require('groq-sdk').default || require('groq-sdk');

// Initialize Groq with the provided API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { message, previousMessages } = req.body;

        // Construct messages array with system context
        const messages = [
            {
                role: 'system',
                content: `You are a helpful AI Assistant for an Academic ERP System. 
                You are assisting a user who is either a Faculty member or an Admin.
                Your goal is to answer questions about the system, education, or general tasks helpful for their role.
                Be concise, professional, and helpful.`
            },
            ...(previousMessages || []).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            })),
            { role: 'user', content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        });

        res.json({
            success: true,
            reply: chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error("Chat Error:", error);
        // Fallback response so the chat doesn't break
        res.json({
            success: true,
            reply: `Error: ${error.message}. Please check server logs.`
        });
    }
});

module.exports = router;
