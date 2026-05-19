import express from 'express';
import type { Request, Response } from 'express';
import authRoute from './controllers/auth-controllers.ts';
import { redisClientConnection } from './utils/engine-client.ts';
import orderRoute from './controllers/orders-controllers.ts';
import balanceTopupRoute from './controllers/balance-controllers.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/topup', balanceTopupRoute);
app.use('/api/order', orderRoute);
app.get('/', (req: Request, res: Response) => {
    res.send(`Hello world from server`);
});

await redisClientConnection();
app.listen(PORT, () => {
    console.log(`App is listening on the port, ${PORT}`);
})

