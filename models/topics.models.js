const db = require("../db/connection");

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics;`)
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertTopic = (slug, description) => {
    if (!slug || !description || slug.trim() === '') {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const defaultImgUrl = 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700';

    return db.query(`
      INSERT INTO topics (slug, description, img_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [slug.trim(), description, defaultImgUrl])
        .then(({ rows }) => {
            return rows[0];
        });
};