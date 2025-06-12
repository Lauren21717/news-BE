const path = require('path');
const { selectEndpoints } = require('../models/api.models');

exports.getApi = async (req, res, next) => {
    try {
        const acceptHeader = req.get('Accept');
        
        if (acceptHeader && acceptHeader.includes('text/html')) {
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
        } else {
            const endpoints = await selectEndpoints();
            res.status(200).send({ endpoints });
        }
    } catch (error) {
        next(error);
    }
};
