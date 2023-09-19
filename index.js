require('dotenv').config()
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user'); 
const userRoutes = require('./routes/users');

const PORT = 5000;
const app = express();

app.use(cors());                                                         // This helps to deal with CORS issues when your frontend communicates with the backend.
app.use(express.json());
app.use('/api/users', userRoutes);

const MONGODB_URI = "mongodb://localhost:27017/chatbotdatabase";         

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB!");
  }); 

mongoose.connection.on("error", (error) => {
    console.log("Failed to connect to MongoDB: ", error);
  });

app.get('/', (req, res) => {                                           // For checking if the server is running in the browser by going to http://localhost:5000/
    res.send('Server is running');
});

app.get('/api/chats/:username', async (req, res) => {                  // Here we can use any name in place of :username. The dynamic route's 'username' value sent from front end can be accessed here with any name . eg. we can also write /api/chats/:desiredstring. Then we will ahve to access it in code below as req.params.desiredstring
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


app.post('/sendMessage', async (req, res) => {
    const userMessage = req.body.message;
    console.log("Prompt", userMessage);
  
    try {
        const openaiResponse = await axios.post('https://api.openai.com/v1/engines/babbage/completions', {   // I have used babbage model is used here, we can also use ada, curie or davinci.
            prompt: userMessage,
            max_tokens: 40,
            temperature: 0.6
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const botReply = openaiResponse.data.choices[0].text.trim();
        const testbotReply = openaiResponse.data;
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ error: "Failed to get response from OpenAI." });
    }
});

app.listen(PORT, () => {                                                         // It says backend to listen to the requests that come at the port 5000.
    console.log(`Server started on http://localhost:${PORT}`);
});