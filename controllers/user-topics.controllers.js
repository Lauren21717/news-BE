const { insertUserTopic } = require('../models/user-topics.models');

exports.postUserTopic = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { topic } = req.body;
        const user_topic = await insertUserTopic(username, topic);
        res.status(201).send({ user_topic });
    } catch (error) {
        next(error);
    }
};