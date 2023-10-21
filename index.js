require('dotenv').config()
const cors = require('cors');
const axios = require('axios');
const express = require('express');
// const mongoose = require('mongoose');
// const User = require('./models/user'); 
const userRoutes = require('./routes/chatbotAPI');

const PORT = 5000;
const app = express();

console.log("test backend server running")
app.use(cors());                                                         // This helps to deal with CORS issues when your frontend communicates with the backend.
app.use(express.json());

app.get('/test-log', (req, res) => {
  console.log('Test backend server running');
  res.send('Log statement triggered');
});

app.use('/api', userRoutes);

// // const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chatbotdatabase";  
// const MONGODB_URI = `mongodb+srv://hamzabajwa:${process.env.DB_PASSWORD}@chatbotcluster.lnqgyhj.mongodb.net/chatbotdatabase?retryWrites=true&w=majority`;


// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// mongoose.connection.on("connected", () => {
//   console.log("Connected to MongoDB!");
// });

// mongoose.connection.on("error", (error) => {
//   console.log("Failed to connect to MongoDB: ", error);
// });

app.get('/', (req, res) => {                                           // For checking if the server is running in the browser by going to http://localhost:5000/
  res.send('Server is runnning');
});


app.listen(PORT, () => {                                               // It says backend to listen to the requests that come at the port 5000.
  console.log(`Server started on http://localhost:${PORT}`);
});