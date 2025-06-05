const commentsRouter = require('express').Router();
const { patchCommentById ,deleteCommentById } = require('../controllers/comments.controllers');

// Handle /api/comments/:comment_id
commentsRouter
    .route('/:comment_id')
    .patch(patchCommentById)
    .delete(deleteCommentById);

module.exports = commentsRouter;