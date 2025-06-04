const express = require('express');
const { getApi } = require('./controllers/api.controllers');
const { getTopics } = require('./controllers/topics.controllers');
const { getArticles } = require('./controllers/articles.controllers');

const app = express();

app.use(express.json());

// routes
app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);



module.exports = app;