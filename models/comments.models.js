const db = require("../db/connection");

exports.selectCommentsByArticleId = async (article_id, limit = 10, p = 1) => {
    // Convert abd validate pagination
    const limitNum = Number(limit);
    const pageNum = Number(p);

    if (isNaN(limitNum) || isNaN(pageNum) || limitNum < 1 || pageNum < 1) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const offset = (pageNum - 1) * limitNum;

    // if article exists exists
    const articleCheck = await db.query('SELECT * FROM articles WHERE article_id = $1;', [article_id]);
    if (articleCheck.rows.length === 0) {
        if (isNaN(Number(article_id))) {
            return Promise.reject({ status: 400, msg: 'Bad request' });
        }
        return Promise.reject({ status: 404, msg: 'Article not found' });
    }

    // Get total count of comments
    const countResult = await db.query('SELECT COUNT(*) FROM comments WHERE article_id = $1;', [article_id]);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated comments
    const commentsResult = await db.query(`
        SELECT comment_id, votes, created_at, author, body, article_id
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
    `, [article_id, limitNum, offset]);

    return { comments: commentsResult.rows, total_count: totalCount };
};

exports.insertComment = async (article_id, username, body) => {
    if (!username || !body) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const { rows } = await db.query(`
        INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING *;
    `, [article_id, username, body])

    return rows[0];
};

exports.removeCommentById = async (comment_id) => {
    const { rows } = await db.query(`
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;
    `, [comment_id])

    if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Comment not found' });
    }

    return rows[0];
};

exports.updateCommentById = async (comment_id, inc_votes) => {
    if (typeof inc_votes !== 'number') {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const { rows } = await db.query(`
        UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING *;
    `, [inc_votes, comment_id])

    if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Comment not found' });
    }

    return rows[0];
};