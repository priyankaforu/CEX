import { createClient } from 'redis';
import { ORDERBOOKS, FILLS, BALANCES, ORDERRECORDS, CreateOrder, Fill, RestingOrders, OrderRecord, OrderStatus, Balance, TopupPayload } from './src/store/db-store.ts';
const client = createClient();

await client.connect();

for (; ;) {
    const item = await client.brPop('backend-redis-queue', 0);
    if (!item) continue;

    let data;

    const message = JSON.parse(item.element);
    switch (message.type) {
        case 'create-order':
            data = handleCreateOrder(message.payload);
        case 'top-up':
            data = handleTopUp(message.payload);
    }
    const response = {
        correlationId: message.correlationId,
        data
    }


    await client.lPush(message.RESPONSE_QUEUE, JSON.stringify(response));
}

// handle TopUp
function handleTopUp(payload: TopupPayload) {

    /*{ BALANCES = { 102: {usd:{ available_funds : 100 , locked_funds: 50 }, eth: {available_funds: 20, locked_funds: 0 }} */
    console.log('payload:', JSON.stringify(payload));
    const { userId, symbol, amount } = payload;


    const user = BALANCES.get(userId);

    if (user) {
        user[symbol].available_funds += amount;
    } else {
        BALANCES.set(userId, {
            [symbol]: { available_funds: payload.amount, locked_funds: 0 }
        })
    }

    return BALANCES.get(userId);


}



// handle Create Order from User

function handleCreateOrder(payload: CreateOrder) {
    console.log('payload:', JSON.stringify(payload));
    const isBuy = payload.side === 'buy'

    const orderId = crypto.randomUUID();
    let current_filled_qty = 0;
    let orderFills = [];
    let tradeQty = 0; // the quantity that can be exchanged
    let orderbook = ORDERBOOKS.get(payload.symbol);


    if (!orderbook) {
        orderbook = { bids: new Map(), asks: new Map() };
        ORDERBOOKS.set(payload.symbol, orderbook);
    }
    const matchSide = isBuy ? orderbook.asks : orderbook.bids;
    const restSide = isBuy ? orderbook.bids : orderbook.asks;
    console.log('side:', payload.side);
    console.log('orderbook bids:', [...orderbook.bids.entries()]);
    console.log('orderbook asks:', [...orderbook.asks.entries()]);

    const priceMatches = (levelPrice: number) => isBuy ?
        payload.price !== null && payload.price >= levelPrice :
        payload.price !== null && payload.price <= levelPrice;

    //find first the type of order from the payload
    let sortedPrices = [...matchSide.keys()].sort((a, b) => isBuy ? a - b : b - a);
    // loop over the "items" in that "array"
    for (let counterPrice of sortedPrices) {
        if (priceMatches(counterPrice)) {
            let orderAtThatPrice = matchSide.get(counterPrice)!;
            //orderAtThatPrice is an array where all the deals for the price is listed so...

            for (let i = 0; i < orderAtThatPrice.length; i++) {
                let counterOrderId = orderAtThatPrice[i];   // get thse counterOrderId order details 
                let remaining_current_qty = payload.qty - current_filled_qty; // find the buyer's remaining qty
                let available_counter_qty = counterOrderId.qty - counterOrderId.filledQty // find the counterOrderId's remaining qty
                tradeQty = Math.min(available_counter_qty, remaining_current_qty); // find the amount of qty they could trade
                counterOrderId.filledQty += tradeQty; // update the traded qty of counterOrderId
                current_filled_qty += tradeQty;  //  update the traded qty of the buyer 
                const fill: Fill = {
                    fillId: crypto.randomUUID(),
                    buyOrderId: isBuy ? orderId : counterOrderId.orderId,
                    sellOrderId: isBuy ? counterOrderId.orderId : orderId,
                    symbol: payload.symbol,
                    price: counterPrice,
                    qty: tradeQty,
                    createdAt: Date.now()
                }
                FILLS.push(fill);
                orderFills.push(fill);
                if (payload.qty === current_filled_qty) break;

            }
            const remainingQty = orderAtThatPrice.filter(order => order.filledQty < order.qty);
            if (remainingQty.length === 0) {
                matchSide.delete(counterPrice);
            } else {
                matchSide.set(counterPrice, remainingQty);
            }
            if (payload.qty === current_filled_qty) break;
        } else {
            break;
        }
    }

    let status: OrderStatus;
    if (current_filled_qty === payload.qty) status = 'filled';
    else if (current_filled_qty > 0) status = 'partially-filled';
    else status = 'open'

    if (current_filled_qty < payload.qty && payload.type == 'limit') {
        const restingOrder: RestingOrders = {
            userId: payload.userId,
            orderId: orderId,
            orderType: 'limit',
            side: payload.side,
            qty: payload.qty,
            price: payload.price!,
            symbol: payload.symbol,
            filledQty: current_filled_qty,
            orderStatus: status,
            createdAt: Date.now()

        }
        const existingOrders = restSide.get(payload.price!) || [];
        existingOrders.push(restingOrder);
        restSide.set(payload.price!, existingOrders);
    }

    let record: OrderRecord = {
        userId: payload.userId,
        orderId: orderId,
        orderType: payload.type,
        side: payload.side,
        price: payload.price,
        symbol: payload.symbol,
        qty: payload.qty,
        filledQty: current_filled_qty,
        status: status,
        fill: orderFills,
        createdAt: Date.now()
    }
    ORDERRECORDS.set(orderId, record);
    return record;
}
