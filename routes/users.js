//This is the route file that will handle request related to users, like register, login, and like this.

const express = require('express');
const router = express.Router();
const User = require('../models/user');                             // Assuming we saved our Mongoose model in models/user.js


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