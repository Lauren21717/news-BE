const db = require("../db/connection")

exports.selectArticles = (sort_by = 'created_at', order = 'desc', topic) => {
    const validSortBy = ['title', 'topic', 'author', 'created_at', 'votes', 'comment_count'];
    const validOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    if (!validOrder.includes(order.toLowerCase())) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    let queryStr = `
        SELECT 
            a.author, a.title, a.article_id,
            a.topic, a.created_at, a.votes,
            a.article_img_url, 
            COUNT(comments.comment_id) AS comment_count
        FROM articles a
        LEFT JOIN comments ON a.article_id = comments.article_id`;

    const queryValues = [];

    if (topic) {
        // First check if topic exists
        return db.query('SELECT * FROM topics WHERE slug = $1;', [topic])
            .then(({ rows }) => {
                if (rows.length === 0) {
                    return Promise.reject({ status: 404, msg: 'Topic not found' });
                }

                queryStr += ` WHERE a.topic = $1`;
                queryValues.push(topic);

                queryStr += ` GROUP BY a.article_id ORDER BY ${sort_by} ${order.toUpperCase()};`;

                return db.query(queryStr, queryValues);
            })
            .then(({ rows }) => {
                return rows.map((article) => {
                    return {
                        ...article,
                        comment_count: +article.comment_count
                    };
                });
            });
    }

    queryStr += ` GROUP BY a.article_id ORDER BY ${sort_by} ${order.toUpperCase()};`;

    return db.query(queryStr, queryValues).then(({ rows }) => {
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

exports.insertArticle = (author, title, body, topic, article_img_url) => {
    if (!author || !title || !body || !topic) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const defaultImageUrl = 'https://images.pexels.com/photos/11035481/pexels-photo-11035481.jpeg?w=700&h=700';
    const imageUrl = article_img_url || defaultImageUrl;

    return db.query(`
        INSERT INTO articles (author, title, body, topic, article_img_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `, [author, title, body, topic, imageUrl])
      .then(({ rows }) => {
        const article = rows[0];
        return { ...article, comment_count: 0 };
      });
}