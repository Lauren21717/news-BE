const db = require("../connection");
const format = require("pg-format");
const { dropTables, createTables } = require('../manage-tables');
const { convertTimestampToDate } = require('./utils');

const seed = ({ 
  topicData, userData, 
  articleData, commentData, 
  emojiData, userFollowsData, 
  emojiReactionsData 
}) => {
  let articlesInsertResult;

  return dropTables()
    .then(() => {
      return createTables();
    })
    .then(() => {
      return insertTopics(topicData);
    })
    .then(() => {
      return insertUsers(userData);
    })
    .then(() => {
      return insertEmojis(emojiData);
    })
    .then(() => {
      return insertArticles(articleData);
    })
    .then((result) => {
      articlesInsertResult = result;
      return insertComments(commentData, result.rows);
    })
    .then(() => {
      return insertUserFollows(userFollowsData);
    })
    .then(() => {
      return insertEmojiReactions(emojiReactionsData, articlesInsertResult.rows);
    });
};

const insertTopics = (topicData) => {
  const topicsInsertStr = format(
    `INSERT INTO topics 
      (slug, description, img_url) 
      VALUES %L;`,
    topicData.map(({ slug, description, img_url }) => [
      slug,
      description,
      img_url,
    ])
  );
  return db.query(topicsInsertStr);
};

const insertUsers = (userData) => {
  const usersInsertStr = format(
    `INSERT INTO users 
      (username, name, avatar_url) 
      VALUES %L;`,
    userData.map(({ username, name, avatar_url }) => [
      username,
      name,
      avatar_url,
    ])
  );
  return db.query(usersInsertStr);
};

const insertArticles = (articleData) => {
  const formattedArticleData = articleData.map(convertTimestampToDate);

  const articlesInsertStr = format(
    `INSERT INTO articles 
      (title, topic, author, body, created_at, votes, article_img_url) 
      VALUES %L 
      RETURNING *;`,
    formattedArticleData.map(({ title, topic, author, body, created_at, votes, article_img_url }) => [
      title, 
      topic, 
      author, 
      body, 
      created_at, 
      votes, 
      article_img_url
    ])
  );
  return db.query(articlesInsertStr);
};

const insertComments = (commentData, articles) => {
  const formattedCommentData = commentData.map(convertTimestampToDate);

  const articleRef = articles.reduce((lookup, article) => {
    lookup[article.title] = article.article_id;
    return lookup;
  }, {});

  const commentsInsertStr = format(
    `INSERT INTO comments 
      (article_id, body, author, created_at, votes)
      VALUES %L;`,
      formattedCommentData.map((comment) => [
        articleRef[comment.article_title],
        comment.body,
        comment.author,
        comment.created_at,
        comment.votes,
      ])
  );
  return db.query(commentsInsertStr);
};

const insertEmojis = (emojiData) => {
  const emojiInsertStr = format(
    `INSERT INTO emojis
      (emoji, emoji_name)
      VALUES %L
      RETURNING *;`,
    emojiData.map(({ emoji, emoji_name }) => [
      emoji,
      emoji_name
    ])
  );
  return db.query(emojiInsertStr);
};

const insertUserFollows = (userFollowsData) => {
  const userFollowsInsertStr = format(
    `INSERT INTO user_topic
      (username, topic)
      VALUES %L;`,
    userFollowsData.map(({ username, topic }) => [
      username,
      topic
    ])
  );
  return db.query(userFollowsInsertStr);
};

const insertEmojiReactions = (emojiReactionsData, articles) => {
  const articleRef = articles.reduce((lookup, article) => {
    lookup[article.title] = article.article_id;
    return lookup;
  }, {});

  return db.query(`SELECT * FROM emojis;`)
    .then(({ rows: emojis }) => {
      const emojiRef = emojis.reduce((lookup, emoji) => {
        lookup[emoji.emoji_name] = emoji.emoji_id;
        return lookup;
      }, {});

      const reactionsInsertStr = format(
        `INSERT INTO emoji_article_user
          (emoji_id, username, article_id)
          VALUES %L;`,
        emojiReactionsData.map((reaction) => [
          emojiRef[reaction.emoji_name],
          reaction.username,
          articleRef[reaction.article_title]
        ])
      );

      return db.query(reactionsInsertStr);
    });
};

module.exports = seed;
