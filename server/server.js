require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/db');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured.');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: 'Server error.', details: error.message });
});

const port = Number(process.env.PORT || 5000);
connectDatabase()
  .then(() => app.listen(port, () => console.log(`CCPD API listening on port ${port}`)))
  .catch((error) => {
    console.error('Database connection failed.', error);
    process.exit(1);
  });
