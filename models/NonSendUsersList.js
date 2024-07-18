const mongoose = require('mongoose');

const nonSendUsersListSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    resourceType: {
        type: String,
        required: true,
    },
    toUserId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true,
    },
    metaData: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: ()=> Date.now() },
    deletedAt: { type: Date, default: null },
})

module.exports = mongoose.model('NonSendUsersList', nonSendUsersListSchema);