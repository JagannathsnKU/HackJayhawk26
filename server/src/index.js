import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '32kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authLimiter, authRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Auth API listening on http://localhost:${PORT}`);
});
