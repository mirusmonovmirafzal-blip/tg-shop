require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRouter = require('./routes/products');
const { router: ordersRouter } = require('./routes/orders');
const clickRouter = require('./routes/click');
const maternityRouter = require('./routes/maternity');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', productsRouter);
app.use('/api', maternityRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/click', clickRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve React frontend (built files)
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
