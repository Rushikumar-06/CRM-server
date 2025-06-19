const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contacts', contactRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port 5000")
);
