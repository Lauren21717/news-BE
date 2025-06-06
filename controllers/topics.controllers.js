const { selectTopics, insertTopic } = require("../models/topics.models")

exports.getTopics = async (req, res, next) => {
    try {
        const topics = await selectTopics();
        res.status(200).send({ topics });
    } catch (error) {
        next(error);
    }
};

exports.postTopic = async (req, res, next) => {
    try {
        const { slug, description } = req.body;
        const topic = await insertTopic(slug, description);
        res.status(201).send({ topic });
    } catch (error) {
        next(error);
    }
};