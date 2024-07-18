const router = require('express').Router()
const { authentication } = require('../middleware/authentication');
const { createUserValidation, loginUserValidation} = require('../validation/user');
const { loginHandler, registerHandler } = require('./login/loginHandler');
const userHandler = require('./user');
const postsHandler = require('./posts');

router.post('/login', loginUserValidation, loginHandler)
router.post('/register', createUserValidation, registerHandler)
router.use(authentication)
router.use('/users', userHandler)
router.use('/posts', postsHandler)

module.exports = exports = router