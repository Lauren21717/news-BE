const { 
    selectCommentsByArticleId,
    insertComment,
    removeCommentById,
    updateCommentById
} = require("../models/comments.models");

exports.getCommentsByArticleId = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const { limit, p } = req.query;
        const { comments, total_count } = await selectCommentsByArticleId(article_id, limit, p);
        res.status(200).send({ comments, total_count });
    } catch (error) {
        next(error);
    }
};

exports.postComment = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const { username, body } = req.body;
        const comment = await insertComment(article_id, username, body);
        res.status(201).send({ comment });
    } catch (error) {
        next(error);
    }
};

exports.deleteCommentById = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        await removeCommentById(comment_id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.patchCommentById = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        const { inc_votes } = req.body;

        const comment = await updateCommentById(comment_id, inc_votes);
        res.status(200).send({ comment });
    } catch (error) {
        next(error);
    }
};
