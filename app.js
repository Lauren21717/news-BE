const express = require('express');
const cors = require('cors');
const apiRouter = require('./routers/api.router');

const app = express();

app.use(cors());
app.use(express.json())

// all routes
app.use('/api', apiRouter);

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