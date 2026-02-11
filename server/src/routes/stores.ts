import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const storeSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    postcode: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
    notes: z.string().optional(),
    type: z.enum(['DELIVERY_STA', 'FSL_STA']).optional(),
});

// GET /stores - Public
router.get('/', async (req, res) => {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
});

// PATCH /stores/:id/note - Public
router.patch('/:id/note', async (req, res) => {
    const { id } = req.params;
    const noteSchema = z.object({
        note: z.string().max(500), // Limit note length
    });

    const result = noteSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    try {
        const store = await prisma.store.update({
            where: { id },
            data: { notes: result.data.note },
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// POST /stores - Admin only
router.post('/', requireAuth, async (req, res) => {
    const result = storeSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    try {
        const store = await prisma.store.create({
            data: result.data,
        });
        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create store' });
    }
});

// PUT /stores/:id - Admin only
router.put('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const result = storeSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    try {
        const store = await prisma.store.update({
            where: { id },
            data: result.data,
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update store' });
    }
});

// DELETE /stores/:id - Admin only
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.store.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete store' });
    }
});

export default router;
