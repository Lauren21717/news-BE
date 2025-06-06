const {
    selectArticles,
    selectArticleById,
    updateArticleById,
    insertArticle,
    removeArticleById
} = require("../models/articles.models")

exports.getArticles = (req, res, next) => {
    const { sort_by, order, topic, limit, p } = req.query;

    selectArticles(sort_by, order, topic, limit, p)
        .then(({ articles, total_count }) => {
            res.status(200).send({ articles, total_count });
        })
        .catch(next);
};

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;

    selectArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};

exports.patchArticleById = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    if (inc_votes === undefined) {
        return next({ status: 400, msg: 'Bad request' });
    }

    updateArticleById(article_id, inc_votes)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};

exports.postArticle = (req, res, next) => {
    const { author, title, body, topic, article_img_url } = req.body;

    insertArticle(author, title, body, topic, article_img_url)
        .then((article) => {
            res.status(201).send({ article });
        })
        .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
    const { article_id } = req.params;
    
    removeArticleById(article_id)
      .then(() => {
        res.status(204).send();
      })
      .catch(next);
  };