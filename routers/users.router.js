const usersRouter = require('express').Router();
const { postUserTopic } = require('../controllers/user-topics.controllers');
const { getUsers, getUserByUsername } = require('../controllers/users.controllers');

// Handle /api/users
usersRouter
    .route('/')
    .get(getUsers);

// Handle /api/users/:username
usersRouter
    .route('/:username')
    .get(getUserByUsername);

// Handle /api/users/:username/topics
usersRouter
    .route('/:username/topics')
    .post(postUserTopic)

module.exports = usersRouter;