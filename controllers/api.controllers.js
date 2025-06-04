const { selectEndpoints } = require('../models/api.models');

exports.getApi = (req, res, next) => {
    selectEndpoints()
        .then((endpoints) => {
            res.status(200).send({ endpoints });
        })
        .catch(next);
};