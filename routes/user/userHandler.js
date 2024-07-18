const { updateUserDetails, createOrUpdateUserBookmarks, getUserBookmarks, getNetWorkPeoplePosts, userProfile, getUser } = require("../../controllers/userController");
const { customResponse, sendErrorResponse } = require("../../utils/util");
getUserBookmarks
const updateUserHandler = async (req, res) =>{
try {
    const result = await updateUserDetails(req.body, req.currentUser._id);
    customResponse(200, result, res)
} catch (error) {
    sendErrorResponse(error, res);
}
}

const createOrUpdateBookmarkHandler = async (req, res) =>{
    try {
        const result = await createOrUpdateUserBookmarks(req.params, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
    }

const getBookmarkHandler = async (req, res) =>{
        try {
            const result = await getUserBookmarks(req.query, req.currentUser._id);
            customResponse(200, result, res)
        } catch (error) {
            sendErrorResponse(error, res);
        }
}

const getNetworPostHandler = async (req, res) =>{
    try {
        const result = await getNetWorkPeoplePosts(req.query, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

const getUserProfileHandler = async (req, res) =>{
    try {
        const result = await userProfile(req.query.id, req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}
const getUserHandler = async (req, res) =>{
    try {
        const result = await getUser(req.currentUser._id);
        customResponse(200, result, res)
    } catch (error) {
        sendErrorResponse(error, res);
    }
}

module.exports = {updateUserHandler, createOrUpdateBookmarkHandler, getBookmarkHandler, getNetworPostHandler, getUserProfileHandler, getUserHandler}