const { selectCommentsByArticleId, insertComment } = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    selectCommentsByArticleId(article_id)
        .then((comments) => {
            res.status(200).send({ comments });
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