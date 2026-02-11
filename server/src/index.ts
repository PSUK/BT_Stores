import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
import authRoutes from './routes/auth';
import storeRoutes from './routes/stores';

app.use('/auth', authRoutes);
app.use('/stores', storeRoutes);

// Only listen when running directly (not as Vercel serverless function)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
