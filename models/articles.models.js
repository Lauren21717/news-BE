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

}