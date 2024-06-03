const express = require('express');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

// Configurar mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const KlineSchema = new mongoose.Schema({
  openTime: Date,
  openPrice: String,
  highPrice: String,
  lowPrice: String,
  closePrice: String,
  volume: String,
  closeTime: Date,
  quoteAssetVolume: String,
  numberOfTrades: Number,
  takerBuyBaseAssetVolume: String,
  takerBuyQuoteAssetVolume: String,
  ignore: String,
});

const Kline = mongoose.model('Kline', KlineSchema);

const app = express();
const port = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

// Ruta para obtener y almacenar datos de Binance
app.get('/api/binance/klines', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSDT';
  const interval = req.query.interval || '1h';
  const limit = req.query.limit || 1000;
  const startTime = new Date(req.query.startTime).getTime() || new Date('2023-01-01').getTime();
  const endTime = new Date(req.query.endTime).getTime() || new Date('2023-01-31').getTime();

  const url = 'https://fapi.binance.com/fapi/v1/klines';
  const params = { symbol, interval, limit, startTime, endTime };
  const headers = { 'X-MBX-APIKEY': API_KEY };

  try {
    const response = await axios.get(url, { headers, params });
    const data = response.data.map(entry => ({
      openTime: new Date(entry[0]),
      openPrice: entry[1],
      highPrice: entry[2],
      lowPrice: entry[3],
      closePrice: entry[4],
      volume: entry[5],
      closeTime: new Date(entry[6]),
      quoteAssetVolume: entry[7],
      numberOfTrades: entry[8],
      takerBuyBaseAssetVolume: entry[9],
      takerBuyQuoteAssetVolume: entry[10],
      ignore: entry[11]
    }));

    // Almacenar en MongoDB
    await Kline.insertMany(data);
    console.log(data, "data")
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
