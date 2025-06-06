const { insertEmojiReaction } = require("../models/emoji-reactions.models");


exports.postEmojiReaction = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const { emoji_name, username } = req.body;

        const reaction = await insertEmojiReaction(article_id, emoji_name, username);
        res.status(201).send({ reaction });
    } catch (error) {
        next(error);
    }
};
