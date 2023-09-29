//This is the route file that will handle request related to users, like register, login, and like this.

require('dotenv').config()
const express = require('express');
const router = express.Router();
const chatbotData = require('../data/dataset.json');
const { SessionsClient } = require('@google-cloud/dialogflow')


const projectId = 'musharp-iabf';

router.post('/sendMessage', async (req, res) => {
    const userMessage = req.body.message;

    // Create a new session
    const sessionClient = new SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, '123456'); // Session ID can be random or based on user

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
        console.log(result)
        const DialogFlowReply = result.fulfillmentText;
        console.log(DialogFlowReply)                               

        // let apiMessages = [
        //     { "role": "system", "content": DialogFlowReply },
        //     { "role": "user", "content": userMessage }
        // ];
        let apiMessages = [
            { "role": "system", "content": "You are the virtual assistant representing muSharp. Keep responses concise and to the point. Dont write long details" },
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
            // const botReply = result.intent.isFallback ? "Ask me Questions related to muSharp" : openaiData.choices[0].message.content.trim();


            apiMessages.push({ "role": "assistant", "content": botReply });

            // Check if there is a custom payload
            if (result.fulfillmentMessages) {
                console.log("1")
                for (let message of result.fulfillmentMessages) {
                    if (message.payload) {
                        console.log("2")
                        const bypassOpenAI = message.payload.fields.bypassOpenAI.boolValue;
                        const customMessage = message.payload.fields.message.stringValue;
                        if (bypassOpenAI) {
                            console.log("3")
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












//(1)
// Mongoose Model Naming and Collections:
// When you create a Mongoose model, such as const User = mongoose.model('User', userSchema);, Mongoose automatically looks for the plural, lowercased version of the model name. So, in this case, Mongoose will look for the users collection in the database.
// So, when you're working with Mongoose, you'll use the model (User) to query the collection it represents (users).

// Why the Model (User) and not the Collection (users)?
// Mongoose abstracts a lot of the native MongoDB operations and gives us a more structured way to interact with our data. The model (User in this case) represents the collection and also the structure of documents in that collection.
// When you use User.findOne(), under the hood, Mongoose translates that into a MongoDB command that queries the users collection.
// Using the model provides benefits like validation based on the schema, middleware (hooks), virtuals, and more.

// Collection Name Convention:
// It's true that by default Mongoose uses the plural form of your model name as the collection name. If you named your model 'User', it will use 'users' as the collection. But you can override this default behavior if you want.
// In summary, when working with Mongoose, you will typically interact with the models (like User) to perform operations on the corresponding collections in the database (like users). It's Mongoose's way of providing a higher-level, object-oriented interface to MongoDB.