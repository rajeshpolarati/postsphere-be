const mongoose = require('mongoose');

const postCommentsSchema = new mongoose.Schema({
    postId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Posts',
        required: true,
    },
    commentedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    comment: {
        type: String,
        required: true,
        minLength: 1,
    },
    createdAt: { type: Date, default: ()=> Date.now() },
    updateAt: { type: Date, default: Date.now() },
    deletedAt: { type: Date, default: null },
})

postCommentsSchema.pre("save", function (next) {
    this.updateAt = Date.now();
    next();
  });

module.exports = mongoose.model('PostComments', postCommentsSchema);