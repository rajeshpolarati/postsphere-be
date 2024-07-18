const socketIo = require("socket.io");
const { Kafka } = require("kafkajs");
const fs = require("fs");
const path = require("path");
const models = require("../models");
const { followUser, unFollowUser, getFollowers, getUser, sendFollowPeopleMessageToKafka, createOrUpdateUserBookmarks } = require("../controllers/userController");
const { createOrUpdateLike, createOrUpdateCommentLike, specificPostDetails, insertNonSendUserList, specificCommentDetails, getNonSendUserData, sendPostCommentedMessageToKafka, sendPostLikedMessageToKafka, sendCommentLikedMessageToKafka, getPostDetails } = require("../controllers/postsController");
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER_ID],
  ssl: {
    rejectUnauthorized: false,
    ca: [fs.readFileSync(path.join(__dirname, "certs/ca.pem"), "utf-8")],
    key: fs.readFileSync(path.join(__dirname, "certs/service.key"), "utf-8"),
    cert: fs.readFileSync(path.join(__dirname, "certs/service.cert"), "utf-8"),
  },
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USER_NAME,
    password: process.env.KAFKA_PASSOWORD,
  },
});

const producer = kafka.producer();

let userSocketMap = {};
const realTimeConsumer = kafka.consumer({ groupId: "real-time-updates" });

const connectToKafka = async () => {
  try {
    await realTimeConsumer.connect();
    console.log("Connected to Kafka brokers");

    realTimeConsumer.subscribe({ topic: "posts", fromBeginning: false });
    realTimeConsumer.subscribe({ topic: "comments", fromBeginning: false });
    realTimeConsumer.subscribe({ topic: "likes", fromBeginning: false });
    realTimeConsumer.subscribe({ topic: "follow", fromBeginning: false });

    console.log("Subscribed to topics successfully");
    await realTimeConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            console.log(`Received message on topic ${topic}, partition ${partition}: ${message.value.toString()}`);
            if (topic === 'posts') {
              const postDetails = JSON.parse(message.value.toString());
              if(postDetails?._id){
                const post = await getPostDetails(postDetails?._id)
                if(post?.postId){
                  const followers = await getFollowers(post?.postedByUserId)
                  if(followers.length){
                    let nonSentUsers = [];
                    for (let i = 0; i < followers.length; i++){
                      let socket = userSocketMap[followers[0]._id]
                      if(socket){
                        socket.emit('post-created', post);
                      }else{
                        nonSentUsers.push(followers[0]._id)
                      }
                    }
                    if(nonSentUsers.length){
                     await insertNonSendUserList('posts', post?.postId, nonSentUsers)
                    }
                  }
                }
              }
            } else if (topic === 'comments') {
              const commentDetails = JSON.parse(message.value.toString());
              const commentedByDetails = await getUser(commentDetails?.commentedBy);
              const postedByDetails = await getPostDetails(commentDetails?.postId)
              if(commentedByDetails && postedByDetails?.postId){
                let socket = userSocketMap[postedByDetails?.postedByUserId];
                if(socket){
                  socket.emit('comment-created', {commentDetails, commentedByDetails, postDetails: postedByDetails});
                }else{
                  await insertNonSendUserList('comment', commentDetails?._id, [postedByDetails?.postedByUserId], commentDetails)
                }
              }
               
            } else if (topic === 'likes') {
              const res = JSON.parse(message.value.toString());
              const likeDetails = res?.likeDetails
              let personDetails = await getUser(likeDetails?.likedBy);
              if(res?.type === 'post' && personDetails){
                const post = await getPostDetails(likeDetails?.postId);
                let socket = userSocketMap[post?.postedByUserId];
                if (socket) {
                  socket.emit('post-like-created', {post, likedByDetails: personDetails});
                }else {
                  await insertNonSendUserList('postLike', likeDetails?._id, [post?.postedByUserId], res)
                }
              }
              if(res?.type === 'comment' && personDetails){
                const comment = await specificCommentDetails(likeDetails?.commentId);
                const post = await specificPostDetails(comment?.commentDetails?.postId);
                let socket = userSocketMap[comment?.commentedByUser?.id];
                if (socket) {
                  socket.emit('comment-like-created', {comment, likedByDetails: personDetails, post});
                }else {
                  await insertNonSendUserList('commentLike', likeDetails?._id, [comment?.commentedByUser?.id], res)
                }
              }
              
            } else if (topic === 'follow') {
              const res = JSON.parse(message.value.toString());
              if(res?.follower && res?.following){
                const follower = await getUser(res?.follower);
                const following = await getUser(res?.following);
                if(follower && following){
                  let socket = userSocketMap[following?.id];
                  if(socket){
                    socket.emit('follow-created', {follower, following});
                  }else{
                    await insertNonSendUserList('follow', res?._id, [following?.id], res)
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        },
      });
  } catch (err) {
    console.error("Error in Kafka consumer:", err);
  }
};


const checkUnsentMessages = async(userId) => {
  try {
   let pendingMessage = await getNonSendUserData(userId);
  //  if(pendingMessage?.post?.length){
  //  }
   if(pendingMessage?.comment?.length){
    for await (const comment of pendingMessage?.comment){
      await sendPostCommentedMessageToKafka(JSON.parse(comment?.metaData))
    }
    let ids = pendingMessage?.comment.map((c) => c?._id) || []
    await models.NonSendUsersList.deleteMany({ _id: {$in : ids }})
   }
   if(pendingMessage?.postLike?.length){
    for await (const like of pendingMessage?.postLike){
      await sendPostLikedMessageToKafka(JSON.parse(like?.metaData))
    }
    let ids = pendingMessage?.postLike.map((like) => like?._id) || []
    await models.NonSendUsersList.deleteMany({ _id: {$in : ids }})
   }
   if(pendingMessage?.commentLike?.length){
    for await (const like of pendingMessage?.commentLike){
      await sendCommentLikedMessageToKafka(JSON.parse(like?.metaData))
    }
    let ids = pendingMessage?.commentLike.map((c) => c?._id) || []
    await models.NonSendUsersList.deleteMany({ _id: {$in : ids }})
   }
   if(pendingMessage?.follow?.length){
    for await (const res of pendingMessage?.follow){
      await sendFollowPeopleMessageToKafka(JSON.parse(res?.metaData))
    }
    let ids = pendingMessage?.follow.map((c) => c?._id) || []
    await models.NonSendUsersList.deleteMany({ _id: {$in : ids }})
   }
  } catch (error) {
   console.error(error); 
  }
}
process.on("SIGINT", async () => {
  try {
    await realTimeConsumer.disconnect();
    console.log("Disconnected from Kafka brokers");
    process.exit(0);
  } catch (error) {
    console.error("Error disconnecting from Kafka brokers:", error);
    process.exit(1);
  }
});
connectToKafka()

const findMyUser = (socketId) => {
  let userId = null;
  Object.keys(userSocketMap).forEach((key) => {
    if (userSocketMap[key]?.id === socketId) {
      userId = key;
    }
  });
  return userId;
}
function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Object to store custom user IDs mapped to socket IDs
  userSocketMap = {}

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Example of handling custom user ID association
    socket.on("setUserId", async (userId) => {
      console.log(`started User ${userId} connected with socket ID: ${socket.id}`);
      if(!userSocketMap[userId] || userSocketMap[userId].id !== socket.id) {
        userSocketMap[userId] = socket;
        await checkUnsentMessages(userId)
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
      }
    });
    socket.on("followUser", async (followerId) => {
      const userId = findMyUser(socket.id)
      if(userId){
        await followUser(userId, followerId)
      }
    })
    socket.on("unfollowUser", async (followerId) => {
      const userId = findMyUser(socket.id)
      if(userId){
        await unFollowUser(userId, followerId)
      }
    })
    socket.on("postLike", async (postId) => {
      const userId = findMyUser(socket.id)
      if(userId && postId && typeof postId === "string"){
        await createOrUpdateLike({postId}, userId)
      }
    })
    socket.on("commentLike", async (commentId) => {
      const userId = findMyUser(socket.id)
      if(userId && commentId && typeof commentId === "string"){
        await createOrUpdateCommentLike({commentId}, userId)
      }
    })
    socket.on("postBookmark", async (postId) => {
      const userId = findMyUser(socket.id)
      if(userId && postId && typeof postId === "string"){
        await createOrUpdateUserBookmarks({postId}, userId)
      }
    })
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Clean up userSocketMap when a client disconnects
      Object.keys(userSocketMap).forEach((userId) => {
        if (userSocketMap[userId]?.id === socket.id) {
          delete userSocketMap[userId];
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  });

  return io;
}

module.exports = {initializeSocket, producer};
