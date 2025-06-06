const { insertEmojiReaction } = require("../models/emoji-reactions.models");


exports.postEmojiReaction = (req, res, next) => {
    const { article_id } = req.params;
    const { emoji_name, username } = req.body;

    console.log('POST reaction debug:', { article_id, emoji_name, username });

    insertEmojiReaction(article_id, emoji_name, username)
        .then((reaction) => {
            console.log('Reaction created:', reaction);
            res.status(201).send({ reaction });
        })
        .catch((error) => {
            console.log('Error creating reaction:', error);
            next(error);
        });
};
