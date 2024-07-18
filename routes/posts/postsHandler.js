const { createOrUpdatePost, createOrUpdateComment, createOrUpdateLike, createOrUpdateCommentLike, getAllUserPosts, getTrendingPosts, getLatestPosts, deletePost, peopleRecommendation, getPostsComment, specificPostDetails, deleteComment } = require("../../controllers/postsController");
const { customResponse, sendErrorResponse } = require("../../utils/util");

const createOrUpdatePostHandler = async (req, res) =>{
try {
    const result = await createOrUpdatePost(req.body, req.currentUser._id);
    customResponse(200, result, res)
} catch (error) {
    sendErrorResponse(error, res);
}
}
const createOrUpdateCommentHandler = async (req, res) =>{
    try {
        const result = await createOrUpdateComment(req.body, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const createOrUpdateLikeHandler = async (req, res) =>{
    try {
        const result = await createOrUpdateLike(req.params, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const createOrUpdateCommentLikeHandler = async (req, res) =>{
    try {
        const result = await createOrUpdateCommentLike(req.params, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const getAllPostsHandler = async (req, res) =>{
    try {
        const result = await getAllUserPosts(req.query, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}
const getAllOtherUserPostsHandler = async (req, res) =>{
    try {
        const result = await getAllUserPosts(req.query, req.params.userId);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const getTrendingPostsHandler = async (req, res) =>{
    try {
        const result = await getTrendingPosts(req.query, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}
const getLatestPostsHandler = async (req, res) =>{
    try {
        const result = await getLatestPosts(req.query,req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const getSpecificPostsHandler = async (req, res) =>{
    try {
        const result = await specificPostDetails(req.params.postId,req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const deletePostsHandler = async (req, res) =>{
    try {
        const result = await deletePost(req.params.postId,req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const deleteCommentsHandler = async (req, res) =>{
    try {
        const result = await deleteComment(req.params.commentId,req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}


const getRecommedationsHandler = async (req, res) =>{
    try {
        const result = await peopleRecommendation(req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const getPostCommentsHandler = async (req, res) =>{
    try {
        const result = await getPostsComment(req.query, req.params.postId, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}


module.exports = {deleteCommentsHandler,getSpecificPostsHandler,createOrUpdatePostHandler, createOrUpdateCommentHandler, createOrUpdateLikeHandler, createOrUpdateCommentLikeHandler, getAllPostsHandler, getTrendingPostsHandler, getLatestPostsHandler, deletePostsHandler, getRecommedationsHandler, getPostCommentsHandler, getAllOtherUserPostsHandler}