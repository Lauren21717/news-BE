const usersRouter = require('express').Router();
const { getUsers } = require('../controllers/users.controllers');

// Handle /api/users
usersRouter.route('/').get(getUsers);


module.exports = usersRouter;