const express = require('express');
const { getApi } = require('./controllers/api.controllers');
const { getTopics } = require('./controllers/topics.controllers');
const { getArticles, getArticleById } = require('./controllers/articles.controllers');
const { getUsers } = require('./controllers/users.controllers');

const app = express();

app.use(express.json());

// routes
app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/users', getUsers);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else if (err.code === '22P02') {
        res.status(400).send({ msg: 'Bad request' });
    } else {
        next(err);
    }
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal server error' });
});

module.exports = app;