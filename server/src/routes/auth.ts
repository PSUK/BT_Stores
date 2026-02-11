import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

router.post('/login', (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const { username, password } = result.data;

    // Check against environment variables for Admin
    const adminUser = process.env.ADMIN_USERNAME || 'adminBTStore';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin2211BT';

    if (username === adminUser && password === adminPass) {
        return res.json({ token: 'admin-session-token' });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
});

// Site Access Middleware/Route
router.post('/site-access', (req, res) => {
    const { password } = req.body;
    const sitePassword = process.env.SITE_PASSWORD || 'btkg273##';

    if (password === sitePassword) {
        return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Invalid password' });
});

export default router;
