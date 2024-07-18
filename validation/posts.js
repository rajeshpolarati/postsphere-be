const Joi = require('@hapi/joi')

async function createPostValidation (req,res, next){
    let schemaObj = {
        content: Joi.string().required().error(new Error('content is required')),
    }
    let reqBody = req.body;
    if(req.method === 'PUT'){
        schemaObj.id = Joi.string().required().error(new Error('id is required'))
        reqBody.id = req.params.postId;
    }
    const postSchema = Joi.object(schemaObj);
    Joi.validate(reqBody, postSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function createPostCommentValidation (req,res, next){
    let schemaObj = {
        postId: Joi.string().required().error(new Error('postId is required')),
        comment: Joi.string().required().error(new Error('comment is required')),
    }
    let reqBody = req.body;
    if(req.method === 'PUT'){
        delete schemaObj.postId;
        schemaObj.id = Joi.string().required().error(new Error('id is required'))
        reqBody.id = req.params.commentId;
    }
    const commentSchema = Joi.object(schemaObj);
    Joi.validate(reqBody, commentSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function createPostLikeValidation (req,res, next){
    const likeSchema = Joi.object({
        postId: Joi.string().required().error(new Error('postId is required')),
    });
    Joi.validate(req.params, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function deletePostLikeValidation (req,res, next){
    const likeSchema = Joi.object({
        postId: Joi.string().required().error(new Error('postId is required')),
    });
    Joi.validate(req.params, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function deleteCommentValidation (req,res, next){
    const likeSchema = Joi.object({
        commentId: Joi.string().required().error(new Error('commentId is required')),
    });
    Joi.validate(req.params, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function createCommentLikeValidation (req,res, next){
    const likeSchema = Joi.object({
        commentId: Joi.string().required().error(new Error('commentId is required')),
    });
    Joi.validate(req.params, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function getPostsValidation (req,res, next){
    const likeSchema = Joi.object({
        page: Joi.number().required('Page number is required').min(1).label('Page').error(new Error('page number is required')),
        pageSize: Joi.number().required('Limit is required').min(1).label('Limit').error(new Error('page size is required')),
    });
    Joi.validate(req.query, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}
async function getSpecificPostsValidation (req,res, next){
    const likeSchema = Joi.object({
        postId: Joi.string().required().error(new Error('postId is required')),
    });
    Joi.validate(req.params, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}
async function getOtherPostsValidation (req,res, next){
    const likeSchema = Joi.object({
        userId:Joi.string().required().error(new Error('user Id is required')),
        page: Joi.number().required('Page number is required').min(1).label('Page').error(new Error('page number is required')),
        pageSize: Joi.number().required('Limit is required').min(1).label('Limit').error(new Error('page size is required')),
    });
    Joi.validate({...req.query, ...req.params}, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function getPostCommentsValidation (req,res, next){
    const likeSchema = Joi.object({
        postId: Joi.string().required().error(new Error('postId is required')),
        page: Joi.number().required('Page number is required').min(0).label('Page').error(new Error('page number is required')),
        pageSize: Joi.number().required('Limit is required').min(1).label('Limit').error(new Error('page size is required')),
    });
    Joi.validate({...req.query, ...req.params}, likeSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}




module.exports = {deleteCommentValidation, getSpecificPostsValidation,getOtherPostsValidation,createPostValidation,deletePostLikeValidation, createPostCommentValidation, createPostLikeValidation, createCommentLikeValidation, getPostsValidation, getPostCommentsValidation}