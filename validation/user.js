const Joi = require('@hapi/joi')

async function createUserValidation (req,res, next){
    const userSchema = Joi.object({
        email: Joi.string().email().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/).required().error(new Error('Enter valid email')),
        password: Joi.string().min(8).max(20).required().error(new Error('Enter valid password')),
        firstName: Joi.string().required().error(new Error('firstName is required')),
        lastName: Joi.string().required().error(new Error('lastName is required')),
      });
    Joi.validate(req.body, userSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function updateUserValidation (req,res, next){
    const userSchema = Joi.object({
        firstName: Joi.string().error(new Error('firstName should be a string')),
        lastName: Joi.string().allow('').error(new Error('lastName should be a string')),
        bio: Joi.string().allow('').error(new Error('bio should be a string')),
        url: Joi.string().allow('').error(new Error('url should be a string')),
      });
    Joi.validate(req.body, userSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function loginUserValidation (req,res, next){
    const userSchema = Joi.object({
        email: Joi.string().email().required().error(new Error('Enter valid email')),
        password: Joi.string().required().error(new Error('Enter valid password')),
      });
    Joi.validate(req.body, userSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

async function createOrUpdateBookmarkValidation (req,res, next){
    const bookmarkSchema = Joi.object({
        postId: Joi.string().required().error(new Error('postId is required')),
    });
    Joi.validate(req.params, bookmarkSchema, (err, value) => {
        if (err) {
            res.status(422).json({
                message: err.message
            })
        } else {
            next()
        }
    })
}

module.exports = {createUserValidation, loginUserValidation, updateUserValidation, createOrUpdateBookmarkValidation}