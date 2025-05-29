const db = require("../connection")
const { dropTables, createTables } = require('../manage-tables')

const seed = ({ topicData, userData, articleData, commentData }) => {
  return dropTables()
    .then(() => {
      return createTables();
    });
};
module.exports = seed;
