const db = require("../db/connection");

exports.selectTopics = async () => {
    const { rows } = await db.query(`SELECT * FROM topics;`);
    return rows;
};

exports.insertTopic = async (slug, description) => {
    if (!slug || !description || slug.trim() === '') {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }

    const defaultImgUrl = 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700';

    const { rows } = await db.query(`
      INSERT INTO topics (slug, description, img_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [slug.trim(), description, defaultImgUrl]);

    return rows[0];
};