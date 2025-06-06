const db = require('../db/connection');

exports.selectEmojiReactionsByArticleId = async (article_id) => {
    const { rows } = await db.query(`
        SELECT 
            emojis.emoji,
            emojis.emoji_name,
            COUNT(emoji_article_user.emoji_id) AS count
        FROM emojis
        LEFT JOIN emoji_article_user ON emojis.emoji_id = emoji_article_user.emoji_id 
            AND emoji_article_user.article_id = $1
        GROUP BY emojis.emoji_id, emojis.emoji, emojis.emoji_name
        HAVING COUNT(emoji_article_user.emoji_id) > 0
        ORDER BY count DESC;
    `, [article_id])

    return rows.map(row => ({
        ...row,
        count: +row.count
    }));
};

exports.insertEmojiReaction = async (article_id, emoji_name, username) => {
    if (!emoji_name || !username) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    // check if article exists
    const articleCheck = await db.query('SELECT * FROM articles WHERE article_id = $1;', [article_id]);
    if (articleCheck.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
    }

    // check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1;', [username]);
    if (userCheck.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'User not found' });
    }

    // Get emoji_id
    const emojiCheck = await db.query('SELECT * FROM emojis WHERE emoji_name = $1;', [emoji_name]);
    if (emojiCheck.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Emoji not found' });
    }

    const emoji_id = emojiCheck.rows[0].emoji_id;

    // insert the reaction
    const result = await db.query(`
        INSERT INTO emoji_article_user (emoji_id, username, article_id)
        VALUES ($1, $2, $3)
        RETURNING *;    
    `, [emoji_id, username, article_id]);

    return result.rows[0];
};