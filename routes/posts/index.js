const router = require('express').Router();
const { getSpecificPostsValidation,createPostValidation, createPostCommentValidation, createPostLikeValidation, createCommentLikeValidation, getPostsValidation, deletePostLikeValidation, getPostCommentsValidation, getOtherPostsValidation, deleteCommentValidation } = require('../../validation/posts');
const { createOrUpdatePostHandler, createOrUpdateCommentHandler, createOrUpdateLikeHandler, createOrUpdateCommentLikeHandler, getAllPostsHandler, getTrendingPostsHandler, getLatestPostsHandler, deletePostsHandler, getPostCommentsHandler, getAllOtherUserPostsHandler, getSpecificPostsHandler, deleteCommentsHandler } = require('./postsHandler');
const commentRouter = require('express').Router()
const postLikeRouter = require('express').Router()
const commentLikeRouter = require('express').Router()

commentRouter.get('/:postId',getPostCommentsValidation, getPostCommentsHandler)
commentRouter.delete('/:commentId',deleteCommentValidation, deleteCommentsHandler)
commentRouter.post('/',createPostCommentValidation, createOrUpdateCommentHandler)
commentRouter.put('/:commentId',createPostCommentValidation, createOrUpdateCommentHandler)
postLikeRouter.put('/:postId',createPostLikeValidation, createOrUpdateLikeHandler)
commentLikeRouter.put('/:commentId',createCommentLikeValidation, createOrUpdateCommentLikeHandler)
router.use('/comment', commentRouter)
router.use('/like', postLikeRouter)
router.use('/commentlike', commentLikeRouter)
router.get('/trending',getPostsValidation, getTrendingPostsHandler)
router.get('/latest',getPostsValidation, getLatestPostsHandler)
router.get('/specific/:postId',getSpecificPostsValidation, getSpecificPostsHandler)
router.get('/:userId', getOtherPostsValidation, getAllOtherUserPostsHandler)
router.get('/', getPostsValidation, getAllPostsHandler)
router.post('/create',createPostValidation, createOrUpdatePostHandler)
router.put('/:postId',createPostValidation, createOrUpdatePostHandler)
router.delete('/:postId',deletePostLikeValidation, deletePostsHandler)

module.exports = router;