const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

// -----------comment these if using 2 separate VMs (backend VM + frontend VM)
// If using 1 VM: uncomment these AND run 'npm run build' in frontend first
// NOTE: Vite builds to 'dist/', NOT 'build/' like CRA

// Serve Vite build (dist)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('No MONGO_URI in .env file. Please provide Mongo connection URL.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
