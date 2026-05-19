import { createClient } from 'redis';


const client: ReturnType<typeof createClient> = createClient();

export async function redisClientConnection() {
    await client.connect();
    console.log(`Redis connected`);
}

const RESPONSE_QUEUE = `response-queue`;

const sendToEngine = async (type: string, payload: object, correlationId: string) => {
    const message = {
        type,
        correlationId,
        payload,
        RESPONSE_QUEUE
    }

    await client.lPush("backend-redis-queue", JSON.stringify(message));

    const response = await client.brPop(RESPONSE_QUEUE, 30);

    if (!response) {
        throw new Error(`Response timed out`);
    }

    console.log(response);
    return JSON.parse(response.element);

}

export default sendToEngine;
