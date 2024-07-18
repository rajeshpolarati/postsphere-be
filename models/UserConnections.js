const mongoose = require('mongoose');

const userConnectionsSchema = new mongoose.Schema({
    follower: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    following: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    createdAt: { type: Date, default: ()=> Date.now() },
    updateAt: { type: Date, default: Date.now() },
    deletedAt: { type: Date, default: null },
})

userConnectionsSchema.pre("save", function (next) {
    this.updateAt = Date.now();
    next();
  });

module.exports = mongoose.model('UserConnections', userConnectionsSchema);