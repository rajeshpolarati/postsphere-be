const mongoose = require('mongoose');
const Users = require('./Users');
const UserBookmarks = require('./UserBookmarks');
const UserConnections = require('./UserConnections');
const Posts = require('./Posts');
const PostComments = require('./PostComments');
const PostLikes = require('./PostLikes');
const CommentLikes = require('./CommentLikes');
const NonSendUsersList = require('./NonSendUsersList');

mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("Db connection successful");
}).catch((err)=>{
    console.log(`Getting db connection error: ${err}`);
})

module.exports = {
    Users,
    UserBookmarks,
    UserConnections,
    Posts,
    PostComments,
    PostLikes,
    CommentLikes,
    NonSendUsersList
}