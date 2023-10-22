
require('dotenv').config()
const express = require('express');
const router = express.Router();
const { SessionsClient } = require('@google-cloud/dialogflow')
const projectId = 'musharp-iabf';
const dialogflowCredentials = JSON.parse(process.env.DIALOGFLOW_CREDENTIALS);

router.post('/sendMessage', async (req, res) => {
    const userMessage = req.body.message;

    // Create a new session
    const sessionClient = new SessionsClient({ credentials: dialogflowCredentials });
    const sessionId = Math.random().toString(36).substring(7);
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId); // Session ID can be random or based on user

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userMessage,
                languageCode: 'en-US',
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        const DialogFlowReply = result.fulfillmentText;
        let apiMessages = [
            { "role": "system", "content": "You are an assistant representing muSharp. Keep responses concise and to the point. Dont write long details" },
            { "role": "system", "content": DialogFlowReply },
            { "role": "user", "content": userMessage }
        ];
        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": apiMessages,
            "temperature": 0.3
        };

        try {
            const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            });

            if (!openaiResponse.ok) {
                throw new Error("OpenAI API response was not ok");
            }

            const openaiData = await openaiResponse.json();

            const botReply = openaiData.choices[0].message.content.trim();

            apiMessages.push({ "role": "assistant", "content": botReply });

            // Check if there is a custom payload
            if (result.fulfillmentMessages) {
                for (let message of result.fulfillmentMessages) {
                    if (message.payload) {
                        const bypassOpenAI = message.payload.fields.bypassOpenAI.boolValue;
                        const customMessage = message.payload.fields.message.stringValue;
                        if (bypassOpenAI) {
                            res.json({ reply: DialogFlowReply });
                            return;
                        }
                    }
                }
            }
            res.json({ reply: botReply });

        } catch (error) {
            {
                console.error("Error communicating with OpenAI:", error);
                res.status(500).json({ error: "Failed to get response from OpenAI." });
            }
        }

    } catch (error) {
        console.error("Error communicating with Dialogflow:", error);
        res.status(500).json({ error: "Failed to get response from Dialogflow." });
    }
});

module.exports = router;

















