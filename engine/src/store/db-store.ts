export type Side = "buy" | "sell"
export type OrderType = "limit" | "market"
export type OrderStatus = "open" | "partially-filled" | "filled" | "cancelled"

// Balances : for the user , for every currency of coin he traded there are his available and the locked funds
export interface Balance {
    available_funds: number,
    locked_funds: number
}

// the orders which are staying on the order book , so only limit orders
export interface RestingOrders {
    userId: string,
    orderId: string,
    orderType: "limit",
    side: Side,
    qty: number,
    price: number,
    symbol: string,
    filledQty: number,
    orderStatus: OrderStatus,
    createdAt: number
}

// the record of every transaction from user, every order placed can have the multiple trades
export interface OrderRecord {
    userId: string,
    orderId: string,
    orderType: OrderType,
    side: Side,
    price: number | null,
    symbol: string,
    qty: number,
    filledQty: number,
    status: OrderStatus,
    fill: Fill[],
    createdAt: number
}

//nothing but every trade that happened
export interface Fill {
    fillId: string,
    buyOrderId: string,
    sellOrderId: string,
    symbol: string,
    price: number,
    qty: number
    createdAt: number,
}

//Depth level : at that price (say 80 etc) how many orders from users are resting (3 from user 1, 5 user 2) total 7

// GET /depth/ETH
export interface DepthLevel {
    price: number,
    qty: number
}

export interface DepthResponse {
    symbol: string,
    bids: DepthLevel[],
    asks: DepthLevel[]
}

export interface OrderBook {
    bids: Map<number, RestingOrders[]>;
    asks: Map<number, RestingOrders[]>;
}

export interface CreateOrder {
    userId: string,
    type: OrderType,
    side: Side,
    qty: number,
    price: number | null,
    symbol: string
}
export interface TopupPayload {
    userId: string;
    symbol: string;
    amount: number;
}
export const BALANCES = new Map<string, Record<string, Balance>>();
export const ORDERBOOKS = new Map<string, OrderBook>();
export const ORDERRECORDS = new Map<string, OrderRecord>();
export const FILLS: Fill[] = [];



