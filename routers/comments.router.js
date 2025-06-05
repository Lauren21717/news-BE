const commentsRouter = require('express').Router();
const { deleteCommentById } = require('../controllers/comments.controllers');

// Handle /api/comments/:comment_id
commentsRouter
    .route('/:comment_id')
    .delete(deleteCommentById);

module.exports = commentsRouter;