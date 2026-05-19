import crypto from 'crypto'
const jwtSecretKey = crypto.randomBytes(32).toString('hex');

// Display the generated key in the terminal
console.log(`JWT Secret Key: ${jwtSecretKey}`);
