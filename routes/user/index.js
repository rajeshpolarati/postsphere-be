const router = require('express').Router();
const { getPostsValidation } = require('../../validation/posts');
const { updateUserValidation, createOrUpdateBookmarkValidation } = require('../../validation/user');
const { getRecommedationsHandler } = require('../posts/postsHandler');
const { updateUserHandler, createOrUpdateBookmarkHandler, getBookmarkHandler, getNetworPostHandler, getUserProfileHandler, getUserHandler } = require('./userHandler');

router.post('/update',updateUserValidation, updateUserHandler)
router.put('/bookmark/:postId',createOrUpdateBookmarkValidation, createOrUpdateBookmarkHandler)
router.get('/recommendations', getRecommedationsHandler)
router.get('/bookmarks',getPostsValidation,getBookmarkHandler)
router.get('/network',getPostsValidation,getNetworPostHandler)
router.get('/profile',getUserProfileHandler)
router.get('/', getUserHandler)
module.exports = router;