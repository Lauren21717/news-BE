const db = require("../db/connection");

exports.selectUsers = () => {
    return db.query(`SELECT username, name, avatar_url FROM users;`)
        .then(({ rows }) => {
            return rows;
        });
};

exports.selectUserByUsername = (username) => {
    if (!username || typeof username !== 'string') {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    return db.query(`
        SELECT username, name, avatar_url
        FROM users 
        WHERE username = $1;
        `, [username])
        .then(({rows}) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'User not found' });
            }
            return rows[0];
        });
};