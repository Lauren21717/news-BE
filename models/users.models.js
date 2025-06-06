const db = require("../db/connection");
const { selectFollowedTopicsByUsername } = require("./user-topics.models");

exports.selectUsers = async () => {
    const { rows } = await db.query(`SELECT username, name, avatar_url FROM users;`)
    return rows;
};

exports.selectUserByUsername = async (username) => {
    const userResult = await db.query(`
        SELECT username, name, avatar_url
        FROM users 
        WHERE username = $1;
        `, [username]);

    if (userResult.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'User not found' });
    }

    const user = userResult.rows[0];
    const followedTopics = await selectFollowedTopicsByUsername(username);

    return { ...user, followed_topics: followedTopics };
};