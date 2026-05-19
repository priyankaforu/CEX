# Perps Math Part

### Inputs
{ userId, symbol, price, quantity, margin }

### Math
1. **order-value** or **Position** : `position = price * quantity`
2. **leverage** : `position / margin`
3. *short* (**liquidationPrice**) : `current price of the symbol` + `current price of the symbol / leverage` // for the sell/short 
4. *long* (**liquidationPrice**) : `current price of the symbol` - `current price of the symbol / leverage` // for the buy/long


### Rule of Thumb

```
              current price × quantity
margin  =             ---
                    leverage

margin       current price
---  =            ---
 qty           leverage

```


### How does the liquidation happen ?

```
unrealized loss = (current price - entry price) × qty

Hour 1: ($110 - $100) × 2.5 = $10 × 2.5 = $25
Hour 2: ($105 - $100) × 2.5 = $5  × 2.5 = $12.5
Hour 3: ($115 - $100) × 2.5 = $15 × 2.5 = $37.5
Hour 4: ($108 - $100) × 2.5 = $8  × 2.5 = $20
Hour 5: ($120 - $100) × 2.5 = $20 × 2.5 = $50 → equals margin → liquidated
```

### How does the contract close ?

- A buy/long person should go with sell/short or vice-versa
- Through Auto liquidation of the open position 

**You get 20$ profit , some other has lost their $20**

### Let's Say You Opened...

```
   Position 1: LONG  SOL at $100, qty 10, margin $200
   Position 2: SHORT ETH at $3000, qty 2, margin $300
   Total margin locked: $500
   
   Position 1 (long SOL):
   ($110 - $100) × 10 = +$100 unrealized profit

   Position 2 (short ETH):
   ($3100 - $3000) × 2 = +$200 unrealized loss 
   (price went up, bad for short)

   Net unrealized PnL = +$100 - $200 = -$100 net loss

<!--Unrealized means the user hasn't closed the position yet.-->

   User closes Position 1 (sells SOL at $110):
  +$100 realized profit → added to available balance

   User keeps Position 2 open:
   still -$200 unrealized loss

   Account state:
   Available balance: original + $100 (realized) + $200 (margin returned from closed position)
   Locked margin: $300 (Position 2 still open)
   Unrealized PnL: -$200 (Position 2)

```


