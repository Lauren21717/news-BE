const {
    selectArticles,
    selectArticleById,
    updateArticleById,
    insertArticle,
    removeArticleById
} = require("../models/articles.models")

exports.getArticles = async (req, res, next) => {
    try {
        const { sort_by, order, topic, limit, p } = req.query;
        const { articles, total_count } = await selectArticles(sort_by, order, topic, limit, p);
        res.status(200).send({ articles, total_count });
    } catch (error) {
        next(error);
    }
};

exports.getArticleById = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const article = await selectArticleById(article_id);
        res.status(200).send({ article });
    } catch (error) {
        next(error);
    }
};

exports.patchArticleById = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const { inc_votes } = req.body;

        if (inc_votes === undefined) {
            return next({ status: 400, msg: 'Bad request' });
        }

        const article = await updateArticleById(article_id, inc_votes);
        res.status(200).send({ article });
    } catch (error) {
        next(error);
    }
};

exports.postArticle = async (req, res, next) => {
    try {
        const { author, title, body, topic, article_img_url } = req.body;
        const article = await insertArticle(author, title, body, topic, article_img_url);
        res.status(201).send({ article });
    } catch (error) {
        next(error);
    }
};

exports.deleteArticleById = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        await removeArticleById(article_id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};