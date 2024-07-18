const mongoose = require('mongoose');

const postLikesSchema = new mongoose.Schema({
    postId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Posts',
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

module.exports = mongoose.model('PostLikes', postLikesSchema);