const db = require("../db/connection")

exports.selectArticles = () => {
    return db.query(`
        SELECT 
            a.author, a.title, a.article_id,
            a.topic, a.created_at, a.votes,
            a.article_img_url,
            COUNT(comments.comment_id) AS comment_count
        FROM articles a
        LEFT JOIN comments ON a.article_id = comments.article_id
        GROUP BY a.article_id
        ORDER BY a.created_at DESC;
        `)
        .then(({ rows }) => {
            return rows.map((article) => {
                return {
                    ...article,
                    comment_count: +article.comment_count
                };
            });
        });

};

exports.selectArticleById = (article_id) => {
    return db.query(`
        SELECT 
            articles.*, 
            COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;
    `, [article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'Article not found' });
            }
            return {
                ...rows[0],
                comment_count: +rows[0].comment_count
            };
        });
};

exports.updateArticleById = (article_id, inc_votes) => {
    if (typeof inc_votes !== 'number') {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    return db.query(`
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;   
    `, [inc_votes, article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'Article not found' });
            }
            return rows[0];
        });
};