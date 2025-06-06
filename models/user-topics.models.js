const db = require('../db/connection');

exports.selectFollowedTopicsByUsername = async (username) => {
    const { rows } = await db.query(`
        SELECT topic FROM user_topic 
        WHERE username = $1
        ORDER BY created_at DESC;
    `, [username])

    return rows.map(row => row.topic);
};

exports.insertUserTopic = async (username, topic) => {
    if (!topic) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    // check if user exists
    const userCheck = await db.query(`SELECT * FROM users WHERE username = $1;`, [username]);
    if (userCheck.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'User not found' });
    }

    // check if topic exists
    const topicCheck = await db.query(`SELECT * FROM topics WHERE slug = $1;`, [topic]);
    if (topicCheck.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Topic not found' });
    }

    const result = await db.query(`
        INSERT INTO user_topic (username, topic)
        VALUES ($1, $2)
        RETURNING *;
    `, [username, topic]);

    return result.rows[0];
};