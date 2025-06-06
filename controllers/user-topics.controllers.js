const { insertUserTopic } = require('../models/user-topics.models');

exports.postUserTopic = (req, res, next) => {
    const { username } = req.params;
    const { topic } = req.body;

    insertUserTopic(username, topic)
        .then((user_topic) => {
        res.status(201).send({ user_topic });
        })
        .catch(next);
}