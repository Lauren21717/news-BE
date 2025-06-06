const db = require("./connection");

exports.dropTables = () => {
    return db.query(`DROP TABLE IF EXISTS emoji_article_user;`)
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS user_topic;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS emojis;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS comments;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS articles;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS users;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS topics;`);       
      });
  };
  
exports.createTables = () => {
    return db.query(
        `CREATE TABLE topics(
            slug VARCHAR PRIMARY KEY,
            description VARCHAR NOT NULL,
            img_url VARCHAR(1000)
        );`)
    .then(() => {
        return db.query(
            `CREATE TABLE users(
                username VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                avatar_url VARCHAR(1000)
            );`);
    })
    .then(() => {
        return db.query(
            `CREATE TABLE articles (
                article_id SERIAL PRIMARY KEY,
                title VARCHAR NOT NULL,
                topic VARCHAR NOT NULL REFERENCES topics(slug),
                author VARCHAR NOT NULL REFERENCES users(username),
                body TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                votes INTEGER DEFAULT 0,
                article_img_url VARCHAR(1000)
            );`);
    })
    .then(() => {
        return db.query(
            `CREATE TABLE comments(
                comment_id SERIAL PRIMARY KEY,
                article_id INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
                body TEXT NOT NULL,
                votes INTEGER DEFAULT 0,
                author VARCHAR NOT NULL REFERENCES users(username),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`);
    })
    .then(() => {
        return db.query(
            `CREATE TABLE emojis (
                emoji_id SERIAL PRIMARY KEY,
                emoji VARCHAR NOT NULL,
                emoji_name VARCHAR NOT NULL UNIQUE
            );`);
    })
    .then(() => {
        return db.query(
            `CREATE TABLE user_topic (
                user_topic_id SERIAL PRIMARY KEY,
                username VARCHAR NOT NULL REFERENCES users(username),
                topic VARCHAR NOT NULL REFERENCES topics(slug),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(username, topic)
            );`);
    })
    .then(() => {
        return db.query(
            `CREATE TABLE emoji_article_user (
                emoji_article_user_id SERIAL PRIMARY KEY,
                emoji_id INTEGER NOT NULL REFERENCES emojis(emoji_id),
                username VARCHAR NOT NULL REFERENCES users(username),
                article_id INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(emoji_id, username, article_id)
            );`);
    })
}