const db = require("../db/connection");
const { selectEmojiReactionsByArticleId } = require("./emoji-reactions.models");

exports.selectArticles = async (sort_by = 'created_at', order = 'desc', topic, limit = 10, p = 1) => {
    // Validation
    const validSortBy = ['title', 'topic', 'author', 'created_at', 'votes', 'comment_count'];
    const validOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    if (!validOrder.includes(order.toLowerCase())) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    // Convert and validate pagination
    const limitNum = Number(limit);
    const pageNum = Number(p);

    if (isNaN(limitNum) || isNaN(pageNum) || limitNum < 1 || pageNum < 1) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const offset = (pageNum - 1) * limitNum;

    // Build queries
    let countQuery = `SELECT COUNT(*) FROM articles`;
    let articlesQuery = `
      SELECT 
        articles.author, articles.title, articles.article_id,
        articles.topic, articles.created_at, articles.votes,
        articles.article_img_url, 
        COUNT(comments.comment_id) AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id`;

    const queryValues = [];

    // Handle topic filter
    if (topic) {
        const topicCheck = await db.query('SELECT * FROM topics WHERE slug = $1;', [topic]);
        if (topicCheck.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Topic not found' });
        }

        countQuery += ` WHERE topic = $1`;
        articlesQuery += ` WHERE articles.topic = $1`;
        queryValues.push(topic);
    }

    // Get total count
    const countResult = await db.query(countQuery, queryValues);
    const totalCount = parseInt(countResult.rows[0].count);

    // GROUP BY
    articlesQuery += ` GROUP BY articles.article_id`;

    // Handle ORDER BY
    if (sort_by === 'comment_count') {
        articlesQuery += ` ORDER BY comment_count ${order.toUpperCase()}`;
    } else {
        articlesQuery += ` ORDER BY articles.${sort_by} ${order.toUpperCase()}`;
    }

    // pagination
    articlesQuery += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
    queryValues.push(limitNum, offset);

    // Get articles
    const articlesResult = await db.query(articlesQuery, queryValues);
    const articles = articlesResult.rows.map((article) => ({
        ...article,
        comment_count: +article.comment_count
    }));

    return { articles, total_count: totalCount };
};

exports.selectArticleById = async (article_id) => {
    const articleResult = await db.query(`
        SELECT 
            articles.*, 
            COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;
    `, [article_id])

    if (articleResult.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
    }

    const article = {
        ...articleResult.rows[0],
        comment_count: +articleResult.rows[0].comment_count
    };

    const emojiReactions = await selectEmojiReactionsByArticleId(article_id);

    return { ...article, emoji_reactions: emojiReactions };
};

exports.updateArticleById = async (article_id, inc_votes) => {
    if (typeof inc_votes !== 'number') {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const { rows } = await db.query(`
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;   
    `, [inc_votes, article_id])

    if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
    }

    return rows[0];
};

exports.insertArticle = async (author, title, body, topic, article_img_url) => {
    if (!author || !title || !body || !topic) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const defaultImageUrl = 'https://images.pexels.com/photos/11035481/pexels-photo-11035481.jpeg?w=700&h=700';
    const imageUrl = article_img_url || defaultImageUrl;

    const { rows } = await db.query(`
        INSERT INTO articles (author, title, body, topic, article_img_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `, [author, title, body, topic, imageUrl]);

    const article = rows[0];
    return { ...article, comment_count: 0 };
}

exports.removeArticleById = async (article_id) => {
    const { rows } = await db.query(`
      DELETE FROM articles
      WHERE article_id = $1
      RETURNING *;
    `, [article_id])

    if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
    }
    
    return rows[0];
};