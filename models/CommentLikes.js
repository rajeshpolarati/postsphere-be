const mongoose = require('mongoose');

const commentLikesSchema = new mongoose.Schema({
    commentId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'PostComments',
        required: true,
    },
    likedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    createdAt: { type: Date, default: ()=> Date.now() },
    deletedAt: { type: Date, default: null },
})

module.exports = mongoose.model('CommentLikes', commentLikesSchema);1