const express = require('express');
const { getApi } = require('../controllers/api.controllers');

const topicsRouter = require('./topics.router');
const articlesRouter = require('./articles.router');
const usersRouter = require('./users.router');
const commentsRouter = require('./comments.router');

const apiRouter = express.Router();

// api endpoint
apiRouter.get('/', getApi);

// subrouters
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;