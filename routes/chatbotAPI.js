//This is the route file that will handle request related to users, like register, login, and like this.

require('dotenv').config()
const axios = require('axios');
const express = require('express');
const router = express.Router();
const User = require('../models/user');                             // Assuming we saved our Mongoose model in models/user.js
const chatbotData = require('../data/dataset.json');
// const fetch = require('node-fetch');
// import FuzzySet from 'fuzzyset';
const FuzzySet=require('fuzzyset')


/////// Handle Register request//////
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });                     // (1)
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

 /////// Handle Login request//////
router.post('/login', async (req, res) => {
    console.log("Login api hit")
    const { username, password } = req.body;
    console.log(username,password)

    try {
        const user = await User.findOne({ username });                  //return boolean value
        if (!user) {
            return res.status(400).json({ message: "No user exists with this username" });
        }
        
        if (user.password !== password) {                               // Note: in real-world apps, never store plain passwords, they need to be hashed!
            return res.status(400).json({ message: "Wrong password" });
        }

        res.json({ message: "Login successful" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/savechat', async (req, res) => {
    console.log("savechat api being hit")
    const { username, chatTitle, chatContent } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.chats.push({ title: chatTitle, content: chatContent });
        await user.save();                                                  //In Mongoose, the .save() method is used to save a document to the database. If you were to use user.save() without the await keyword, the save operation would still be initiated, but the code wouldn't wait for it to complete.  For instance, if you try to send a response to the frontend immediately after calling user.save() without waiting for it, you might send a success response even if the save operation ultimately fails.

        res.status(200).json({ message: "Chat saved successfully" });
    } catch (error) {
        console.error("Error saving chat:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/chats/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            res.json({ chats: user.chats });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});


// const companyInfoMap = {
//     clients: ["ClientA", "ClientB", "ClientC"],
//     projects: ["domain X", "domain Y", "domain Z"],
//     history: ["founded in 2000", "rich history"],
// };

// router.post('/sendMessage', async (req, res) => {
//     const userMessage = req.body.message;

//     let chosenContext = "You are an assistant specializing in software-related queries.";  // default context

//     for (let keyword in companyInfoMap) {
//         const fuzzy = FuzzySet(companyInfoMap[keyword]);
//         if (fuzzy.get(userMessage)) {
//             chosenContext = "You are an assistant knowledgeable about our company. Our clients include " + companyInfoMap["clients"].join(", ");
//             break;
//         }
//     }

//     apiMessages = [{ "role": "system", "content": chosenContext }];
//     apiMessages.push({ "role": "user", "content": userMessage });

//     const apiRequestBody = {
//                 "model": "gpt-3.5-turbo",
//                 "messages": apiMessages,
//                 "max_tokens": 30,
//                 "temperature": 0.6
//             };
        
//             try {
//                 const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
//                     method: "POST",
//                     headers: {
//                         "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
//                         "Content-Type": "application/json"
//                     },
//                     body: JSON.stringify(apiRequestBody)
//                 });
        
//                 if (!openaiResponse.ok) {
//                     throw new Error("OpenAI API response was not ok");
//                 }
        
//                 const openaiData = await openaiResponse.json();
        
//                 const botReply = openaiData.choices[0].message.content.trim();
//                 apiMessages.push({ "role": "assistant", "content": botReply });
        
//                 res.json({ reply: botReply });
        
//             } catch (error) {
//                 console.error("Error communicating with OpenAI:", error);
//                 res.status(500).json({ error: "Failed to get response from OpenAI." });
//             }
// });



//////////////////////////////////////////////////////  Working code///////////////////////////////////////////////////////////
let apiMessages = [
    { "role": "system", "content": "muSharp is a software development company specializing in web development, UI/UX design, graphic designing, and digital marketing with a focus on AI solutions. We have been operating for 8 years and have a team of over 35 skilled developers. We have worked with notable clients like OptiCommerce and OCUCO, primarily using technologies such as Reactjs, Wordpress, and Shopify. We are located in Lahore and operate 9 hours daily, from 11AM to 8PM." }
];

router.post('/sendMessage', async (req, res) => {
  
    const userMessage = req.body.message;
    apiMessages.push({ "role": "user", "content": userMessage });

    const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": apiMessages,
        "max_tokens": 40,
        "temperature": 0.2
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

        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ error: "Failed to get response from OpenAI." });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// let message = [
//     {"role": "system", "content": "You are an assistant specializing in software-related queries."}
// ];
// router.post('/sendMessage', async (req, res) => {
  
//     const userMessage = req.body.message;
//     message.push({"role": "user", "content": userMessage});

//     try {
//         const openaiResponse = await axios.post('https://api.openai.com/v1/engines/davinci/completions',
//          {
//             messages: message
//         }, 
//         {   
//                         prompt: userMessage,
//                         max_tokens: 40,
//                         temperature: 0.6
//                     } ,
//         {
//             headers: {
//                 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const botReply = openaiResponse.data.choices[0].text.trim();
//         // message.push({"role": "assistant", "content": botReply});  // Add assistant's reply to messages
        
//         res.json({ reply: botReply });

//     } catch (error) {
//         console.error("Error communicating with OpenAI:", error);
//         res.status(500).json({ error: "Failed to get response from OpenAI." });
//     }
// });



// router.post('/sendMessage', async (req, res) => {
//     console.log("send message hit")
//      const userMessage = req.body.message.replace(/\?/g, '');
//     console.log("usermessage is", userMessage)

//     const datasetResponse = getResponse(userMessage);
//     console.log("datasetResponse",datasetResponse)
//     // if (datasetResponse !== "I'm sorry, I don't have an answer to that. Can I help with something else?") {      //Uncomment it if you donot want to get OpenAI response for mismatching out of scope strings
//         if (datasetResponse !== "Sorry, I don't have an answer for that.") {
//         console.log("prompt matches")
//         return res.json({ reply: datasetResponse });
//     }

//     // If dataset doesn't have an answer, consult OpenAI
//     try {
//         const openaiResponse = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {   
//             prompt: userMessage,
//             max_tokens: 40,
//             temperature: 0.6
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const botReply = openaiResponse.data.choices[0].text.trim();
//         res.json({ reply: botReply });
//     } catch (error) {
//         console.error("Error communicating with OpenAI:", error);
//         res.status(500).json({ error: "Failed to get response from OpenAI." });
//     }
// });

function getResponse(userInput) {

    const excludeWords = ["what", "is", "the", "a", "an", "your","are", "of", "in", "for", "to", "how", "much", "do", "you", "%3F"]; // You can expand this list

    let maxMatchCount = 0;
    let bestResponse = null;
    for (let item of chatbotData) {
        let promptKeywords = item.prompt.toLowerCase().split(/\W+/).filter(word => !excludeWords.includes(word));
        let userInputWords = userInput.toLowerCase().split(/\W+/).filter(word => !excludeWords.includes(word));
        
        let matchCount = 0;

        for (let keyword of promptKeywords) {
            if (userInputWords.includes(keyword)) {
                matchCount++;
            }
        }

        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestResponse = item.response;
        }
    }

    return bestResponse ? bestResponse : "Sorry, I don't have an answer for that.";
}








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