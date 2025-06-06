const articlesRouter = require('express').Router();
const {
    getArticles,
    getArticleById,
    patchArticleById,
    postArticle,
    deleteArticleById
} = require('../controllers/articles.controllers');
const {
    getCommentsByArticleId,
    postComment
} = require('../controllers/comments.controllers');

// handle /api/articles
articlesRouter
    .route('/')
    .get(getArticles)
    .post(postArticle)

// Handle /api/articles/:article_id
articlesRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticleById)
    .delete(deleteArticleById);

// Handle /api/articles/:article_id/comments
articlesRouter
    .route('/:article_id/comments')
    .get(getCommentsByArticleId)
    .post(postComment);

module.exports = articlesRouter;