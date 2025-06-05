const { 
    selectCommentsByArticleId,
    insertComment,
    removeCommentById,
    updateCommentById
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;
    const { limit, p } = req.query;

    selectCommentsByArticleId(article_id, limit, p)
        .then(({ comments, total_count }) => {
            res.status(200).send({ comments, total_count });
        })
        .catch(next);
};

exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    insertComment(article_id, username, body)
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params;

    removeCommentById(comment_id)
        .then(() => {
            res.status(204).send();
        })
        .catch(next);
};

exports.patchCommentById = (req, res, next) => {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;

    if (inc_votes === undefined) {
        return next({ status: 400, msg: 'Bad request' });
    }

    updateCommentById(comment_id, inc_votes)
    .then((comment) => {
        res.status(200).send({ comment });
    })
    .catch(next);
};