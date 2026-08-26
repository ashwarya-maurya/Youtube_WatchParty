const express = require('express');
const app = express();

const env = require("./config/env");
const cors = require("cors");


const healthRoutes = require('./router/health.routes');

app.use(cors({
  origin: env.CLIENT_ORIGIN
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', healthRoutes);

module.exports = app;
