require('dotenv').config()
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const userRoutes = require('./routes/chatbotAPI');

const PORT = 5000;
const app = express();

app.use(cors());                                                         // This helps to deal with CORS issues when your frontend communicates with the backend.
app.use(express.json());

app.use('/api', userRoutes);

app.get('/', (req, res) => {                                           // For checking if the server is running in the browser by going to http://localhost:5000/
  res.send('Server is Runnning');
});


app.listen(PORT, () => {                                               // It says backend to listen to the requests that come at the port 5000.
  console.log(`Server started on http://localhost:${PORT}`);
});