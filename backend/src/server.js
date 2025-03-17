const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const chatRoutes = require('./routes/chat');
const rewardRoutes = require('./routes/rewards'); // Add this line

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route to display "Backend working"
app.get('/', (req, res) => {
  res.send('Backend working');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rewards', rewardRoutes); // Add this line

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});