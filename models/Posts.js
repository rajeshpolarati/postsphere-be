const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    content: {
        type: String,
        minLength: 1,
    },
    createdAt: { type: Date, default: ()=> Date.now() },
    updateAt: { type: Date, default: Date.now() },
    deletedAt: { type: Date, default: null },

})

postsSchema.pre("save", function (next) {
    this.updateAt = Date.now();
    next();
  });

module.exports = mongoose.model('Posts', postsSchema);