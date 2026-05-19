import express from 'express';
import { z } from 'zod';
import sendToEngine from '../utils/engine-client.ts';
const router = express.Router();

const BalanceSchema = z.object({
    userId: z.string(),
    symbol: z.string(), // ETH, USD
    amount: z.number()
})
router.post('/', async (req, res) => {
    // get user amount
    const userTopup = BalanceSchema.safeParse(req.body);
    // safeParse returns only the { success, data, error }
    if (!userTopup.success) {
        return res.status(404).json({
            message: "Invalid data",
            error: userTopup.error

        });
    }
    const correlationId = crypto.randomUUID();
    const response = await sendToEngine('top-up', userTopup.data, correlationId);
    res.json(response);
});

export default router;
