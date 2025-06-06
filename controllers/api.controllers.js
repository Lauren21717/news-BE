const { selectEndpoints } = require('../models/api.models');

exports.getApi = async (req, res, next) => {
    try {
        const endpoints = await selectEndpoints();
        res.status(200).send({ endpoints });
    } catch (error) {
        next(error);
    }
};
