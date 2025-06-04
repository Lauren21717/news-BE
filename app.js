const express = require('express');
const { getApi } = require('./controllers/api.controllers');

const app = express();

app.use(express.json());

// routes
app.get('/api', getApi)

module.exports = app;