const mongoose = require('mongoose');

const userBookmarksSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    postId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Posts',
        required: true,
    },
    createdAt: { type: Date, default: ()=> Date.now() },
    updateAt: { type: Date, default: Date.now() },
    deletedAt: { type: Date, default: null },
})
userBookmarksSchema.pre("save", function (next) {
    this.updateAt = Date.now();
    next();
  });
module.exports = mongoose.model('UserBookmarks', userBookmarksSchema);