const express = require('express');
const { getApi } = require('./controllers/api.controllers');
const { getTopics } = require('./controllers/topics.controllers');
const { getArticles, getArticleById, patchArticleById } = require('./controllers/articles.controllers');
const { getUsers } = require('./controllers/users.controllers');
const { getCommentsByArticleId, postComment } = require('./controllers/comments.controllers');

const app = express();

app.use(express.json());

// get routes
app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.get('/api/users', getUsers);

// patch routes
app.patch('/api/articles/:article_id', patchArticleById);

// post routes
app.post('/api/articles/:article_id/comments', postComment);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else if (err.code === '22P02') {
        res.status(400).send({ msg: 'Bad request' });
    } else if (err.code === '23503') {
        res.status(404).send({ msg: 'Not found' });
    } else if (err.code === '23502') {
        res.status(400).send({ msg: 'Bad request' });
    } else {
        next(err);
    }
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal server error' });
});

module.exports = app;