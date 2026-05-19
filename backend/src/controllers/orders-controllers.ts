import express from 'express'
import { z } from 'zod';
import sendToEngine from '../utils/engine-client.ts';
const router = express.Router();

const OrderSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("limit"),
        side: z.enum(["buy", "sell"]),
        symbol: z.string(),
        price: z.number(),
        qty: z.number()
    }),
    z.object({
        type: z.literal("market"),
        side: z.enum(["buy", "sell"]),
        symbol: z.string(),
        qty: z.number()
    })]
)

router.post('/', async (req, res) => {
    const order = OrderSchema.safeParse(req.body);
    if (!order.success) {
        return res.status(400).json({ message: "please provide all the details", error: order.error })
    }
    const correlationId = crypto.randomUUID();
    const response = await sendToEngine('create-order', { ...order.data, userId: 'test-user' }, correlationId);

    res.json(response);

})

export default router;

