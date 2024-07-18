const models = require("../models");
const { default: mongoose } = require("mongoose");

const sendFollowPeopleMessageToKafka = async (followDetails) => {
  try {
    const { producer } = require("../socket");
    await producer.connect();
    await producer.send({
      topic: "follow",
      messages: [{ value: JSON.stringify(followDetails) }],
    });
    await producer.disconnect();
  } catch (error) {
    console.log(error);
  }
};

const updateUserDetails = async (payload, id) => {
  try {
    let data = await models.Users.find({ _id: id });
    if (!data.length) throw new Error("User not found");
    data = data[0];
    if (payload.hasOwnProperty("firstName")) data.firstName = payload.firstName;
    if (payload.hasOwnProperty("lastName")) data.lastName = payload.lastName;
    if (payload.hasOwnProperty("bio")) data.bio = payload.bio;
    if (payload.hasOwnProperty("url")) data.url = payload.url;
    data.save();
    return data.toJSON();
  } catch (error) {
    throw error;
  }
};

const createOrUpdateUserBookmarks = async (payload, userId) => {
  try {
    let bookmark;
    if (payload.postId) {
      bookmark = await models.UserBookmarks.find({
        postId: payload.postId,
        userId: userId,
        deletedAt: null,
      });
      if (!bookmark.length) {
        bookmark = await models.UserBookmarks.create({
          postId: payload.postId,
          userId: userId,
        });
      } else {
        bookmark = bookmark[0];
        bookmark.deletedAt = new Date();
        bookmark.save();
      }
    }
    return bookmark;
  } catch (error) {
    throw error;
  }
};
const getUserBookmarks = async (payload, userId) => {
  try {
    let bookmarks = await models.UserBookmarks.find({
      userId: userId,
      deletedAt: null,
    });
    let postIds = bookmarks.map((bookmark) => bookmark.postId);
    let pageNumber = +payload.page || 1;
    let pageSize = +payload.pageSize || 10;
    const posts = await models.Posts.aggregate([
      {
        $match: {
          _id: { $in: postIds },
          deletedAt: null,
          "comments.deletedAt": null,
          "likes.deletedAt": null,
        },
      },
      {
        $lookup: {
          from: "postcomments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "userlikes",
        },
      },
      {
        $lookup: {
          from: "userbookmarks",
          localField: "_id",
          foreignField: "postId",
          as: "bookmarks",
        },
      },
      {
        $addFields: {
          bookmarks: {
            $filter: {
              input: "$bookmarks",
              as: "bookmark",
              cond: {
                $and: [
                  { $eq: ["$$bookmark.deletedAt", null] },
                  { $eq: ["$$bookmark.userId", userId] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          userlikes: {
            $filter: {
              input: "$userlikes",
              as: "userlike",
              cond: {
                $and: [
                  { $eq: ["$$userlike.deletedAt", null] },
                  { $eq: ["$$userlike.likedBy", userId] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
          likeCount: { $size: "$likes" },
          bookMarkCount: { $size: "$bookmarks" },
          userlikes: { $size: "$userlikes" },
        },
      },
      {
        $sort: {
          "bookmarks.createdAt": 1,
        },
      },
      {
        $project: {
          id: 1,
          content: 1,
          commentCount: 1,
          likeCount: 1,
          bookMarkCount: 1,
          createdAt: 1,
          userlikes: 1,
          user: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            color: 1,
          },
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]);
    return posts;
  } catch (error) {
    throw error;
  }
};

const getNetWorkPeoplePosts = async (payload, userId) => {
  try {
    let connections = await models.UserConnections.find({
      follower: userId,
      deletedAt: null,
    });
    let ids = connections.map((connection) => connection.following) || [];
    let pageNumber = +payload.page || 1;
    let pageSize = +payload.pageSize || 10;

    const posts = await models.Posts.aggregate([
      {
        $match: {
          postedBy: { $in: ids },
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: "postcomments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "userlikes",
        },
      },
      {
        $lookup: {
          from: "userbookmarks",
          localField: "_id",
          foreignField: "postId",
          as: "bookmarks",
        },
      },
      {
        $addFields: {
          bookmarks: {
            $filter: {
              input: "$bookmarks",
              as: "bookmark",
              cond: {
                $and: [
                  { $eq: ["$$bookmark.deletedAt", null] },
                  { $eq: ["$$bookmark.userId", userId] },
                ],
              },
            },
          },
          comments: {
            $filter: {
              input: "$comments",
              as: "comment",
              cond: {
                $eq: ["$$comment.deletedAt", null],
              },
            },
          },
          likes: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: {
                $eq: ["$$like.deletedAt", null],
              },
            },
          },
        },
      },
      {
        $addFields: {
          userlikes: {
            $filter: {
              input: "$userlikes",
              as: "userlike",
              cond: {
                $and: [
                  { $eq: ["$$userlike.deletedAt", null] },
                  { $eq: ["$$userlike.likedBy", userId] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
          likeCount: { $size: "$likes" },
          bookMarkCount: { $size: "$bookmarks" },
          userlikes: { $size: "$userlikes" },
        },
      },
      {
        $sort: {
          "bookmarks.createdAt": 1,
        },
      },
      {
        $project: {
          id: 1,
          content: 1,
          commentCount: 1,
          likeCount: 1,
          bookMarkCount: 1,
          createdAt: 1,
          userlikes: 1,
          user: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            color: 1,
          },
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]);
    return posts;
  } catch (error) {
    throw error;
  }
};
const userProfile = async (profileId, userId) => {
  let proj = {
    id: 1,
    postCount: 1,
    followingCount: 1,
    followerCount: 1,
    firstName: 1,
    lastName: 1,
    bio: 1,
    url: 1,
    color:1
  };
  // if (profileId !== userId?.toString()) {
  //     delete proj.postCount,
  //     delete proj.followingCount,
  //     delete proj.followerCount;
  // }
  const user = await models.Users.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(profileId),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "postedBy",
        as: "posts",
      },
    },
    {
      $addFields: {
        posts: {
          $filter: {
            input: "$posts",
            as: "post",
            cond: {
              $eq: ["$$post.deletedAt", null],
            },
          },
        },
      },
    },
    {
      $addFields: {
        postCount: { $size: "$posts" },
      },
    },
    {
      $project: proj,
    },
  ]);
  let otherObj = {}
  if(user[0]){
    let following = await models.UserConnections.find({
      follower: profileId,
      deletedAt: null,
    });
    let followers = await models.UserConnections.find({
      following: profileId,
      deletedAt: null,
    });
    otherObj.followingCount = following.length;
    otherObj.followerCount = followers.length;
  }
  if (profileId !== userId?.toString() && user[0]) {
    followingMe = await models.UserConnections.findOne({
        follower: profileId,
        following: userId,
        deletedAt: null,
    });
    followingMe = !!followingMe
    followingHim = await models.UserConnections.findOne({
        follower: userId,
        following: profileId,
        deletedAt: null,
    });
    followingHim = !!followingHim;
    otherObj.followingMe = followingMe;
    otherObj.followingHim = followingHim;
  }
  return {...(user[0] || {}), ...otherObj};
};
const getUser = async (userId) => {
  try {
    let user = await models.Users.findOne(
      { _id: userId },
      { _id: 1, firstName: 1, lastName: 1, color:1 }
    );
    if (!user) return {};
    user = user.toJSON();
    user.id = user._id;
    delete user._id;
    return user;
  } catch (error) {
    throw error;
  }
};

const followUser = async (followerId, followingId) => {
  try {
    let users = await models.Users.find({
      _id: { $in: [followerId, followingId] },
    });
    if (!users || !users.length || users.length !== 2)
      throw new Error(`Users not found`);
    let userConnection = await models.UserConnections.findOne({
      follower: followerId,
      following: followingId,
      deletedAt: null,
    });
    if (userConnection) {
      throw new Error("ALREADY_FOLLOWED");
    }
    userConnection = await models.UserConnections.create({
      follower: followerId,
      following: followingId,
    });
    await sendFollowPeopleMessageToKafka(userConnection);
    return userConnection;
  } catch (error) {
    console.log(error);
  }
};
const unFollowUser = async (followerId, followingId) => {
  try {
    let users = await models.Users.find({
      _id: { $in: [followerId, followingId] },
    });
    if (!users || !users.length || users.length !== 2)
      throw new Error(`Users not found`);
    let userConnection = await models.UserConnections.findOne({
      follower: followerId,
      following: followingId,
      deletedAt: null,
    });
    if (!userConnection) {
      throw new Error("FOLLOW_RECORD_NOT_FOUND");
    }
    userConnection.deletedAt = new Date();
    await userConnection.save();
    return userConnection;
  } catch (error) {
    throw error;
  }
};

const getFollowers = async (userId) => {
  try {
    if(!userId) throw 'Empty user ID'
    const connections = await models.UserConnections.find({
      following: userId,
      deletedAt: null,
    });
    if (!connections.length) return [];
    const followers = await models.Users.find(
      {
        _id: { $in: connections.map((connection) => connection.follower) },
      },
      { _id: 1 }
    );
    return followers;
  } catch (err) {
    console.log(err);
    return [];
  }
};
module.exports = {
  updateUserDetails,
  createOrUpdateUserBookmarks,
  getUserBookmarks,
  getNetWorkPeoplePosts,
  userProfile,
  getUser,
  followUser,
  unFollowUser,
  getFollowers,
  sendFollowPeopleMessageToKafka
};
