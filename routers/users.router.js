const usersRouter = require('express').Router();
const { getUsers, getUserByUsername } = require('../controllers/users.controllers');

// Handle /api/users
usersRouter.route('/').get(getUsers);

// Handle /api/users/:username
usersRouter.route('/:username').get(getUserByUsername);

module.exports = usersRouter;