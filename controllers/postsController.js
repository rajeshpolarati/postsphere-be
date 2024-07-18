const { default: mongoose } = require("mongoose");
const models = require("../models");

const sendPostCreatedMessageToKafka = async (postDetails) => {
  try {
    const { producer } = require("../socket");
    await producer.connect();
    await producer.send({
      topic: "posts",
      messages: [{ value: JSON.stringify(postDetails) }],
    });
    await producer.disconnect();
  } catch (error) {
    console.log(error);
  }
};
const sendPostCommentedMessageToKafka = async (commentDetails) => {
  try {
    const { producer } = require("../socket");

    await producer.connect();
    await producer.send({
      topic: "comments",
      messages: [{ value: JSON.stringify(commentDetails) }],
    });
    await producer.disconnect();
  } catch (error) {
    console.log(error);
  }
};
const sendPostLikedMessageToKafka = async (likeDetails) => {
  try {
    const { producer } = require("../socket");
    await producer.connect();
    await producer.send({
      topic: "likes",
      messages: [{ value: JSON.stringify(likeDetails) }],
    });
    await producer.disconnect();
  } catch (error) {
    console.log(error);
  }
};

const sendCommentLikedMessageToKafka = async (likeDetails) => {
  try {
    const { producer } = require("../socket");
    await producer.connect();
    await producer.send({
      topic: "likes",
      messages: [{ value: JSON.stringify(likeDetails) }],
    });
    await producer.disconnect();
  } catch (error) {
    console.log(error);
  }
};

const createOrUpdatePost = async (payload, userId) => {
  try {
    let post;
    if (payload.id) {
      post = await models.Posts.find({ _id: payload.id, deletedAt: null });
      if (!post.length) throw new Error("Post not found");
      post = post[0];
      post.content = payload.content;
      post.save();
     
    } else {
      post = await models.Posts.create({
        content: payload.content,
        postedBy: userId,
      });
      post.save();
      await sendPostCreatedMessageToKafka(post);
    }
    let user = await models.Users.findOne({ _id: userId });
    let data = {
      id: post?._id,
      _id: post?._id,
      content: post?.content,
      commentCount: 0,
      likeCount: 0,
      bookMarkCount: 0,
      createdAt: post.createdAt,
      userlikes: 0,
      user: [
        {
          _id: user?._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          color: user?.color
        },
      ],
    };
    return data;
  } catch (error) {
    throw error;
  }
};
const deletePost = async (postId) => {
  try {
    if (!postId) throw new Error("Post id is required");
    post = await models.Posts.find({ _id: postId, deletedAt: null });
    if (!post.length) throw new Error("Post not found");
    post = post[0];
    post.deletedAt = new Date();
    post.save();
    return { message: "Post deleted successfully", id: post._id };
  } catch (error) {
    throw error;
  }
};
const getAllUserPosts = async (payload, userId) => {
  try {
    let pageNumber = +payload.page || 1;
    let pageSize = +payload.pageSize || 10;
    const posts = await models.Posts.aggregate([
      {
        $match: {
          postedBy: new mongoose.Types.ObjectId(userId),
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
        $sort: {
          createdAt: -1,
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

const getLatestPosts = async (payload, userId) => {
  try {
    let pageNumber = +payload.page || 1;
    let pageSize = +payload.pageSize || 10;
    const posts = await models.Posts.aggregate([
      {
        $match: {
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
            color:1
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
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

const getTrendingPosts = async (payload, userId) => {
  try {
    let pageNumber = +payload.page || 1;
    let pageSize = +payload.pageSize || 10;
    const posts = await models.Posts.aggregate([
      {
        $match: {
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
            color:1
          },
        },
      },
      {
        $sort: {
          likeCount: -1,
          commentCount: -1,
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

const createOrUpdateComment = async (payload, userId) => {
  try {
    let postComment;
    if (payload.id) {
      postComment = await models.PostComments.find({
        _id: payload.id,
        deletedAt: null,
      });
      if (!postComment.length) throw new Error("Comment not found");
      postComment = postComment[0];
      postComment.comment = payload.comment;
      postComment.save();
    } else {
      postComment = await models.PostComments.create({
        comment: payload.comment,
        commentedBy: userId,
        postId: payload.postId,
      });
      postComment.save();
      await sendPostCommentedMessageToKafka(postComment);
    }
    let commentData = await specificCommentDetails(postComment._id);
    return {...commentData.commentDetails, comment:payload.comment,  user: [{...commentData.commentedByUser}]};
  } catch (error) {
    throw error;
  }
};
const deleteComment = async (commentId) => {
  try {
    if (!commentId) throw new Error("Comment id is required");
    comment = await models.PostComments.find({ _id: commentId, deletedAt: null });
    if (!comment.length) throw new Error("Comment not found");
    comment = comment[0];
    comment.deletedAt = new Date();
    comment.save();
    return { message: "Commented deleted successfully", id: comment._id };
  } catch (error) {
    throw error;
  }
};

const createOrUpdateLike = async (payload, userId) => {
  try {
    let postLike;
    if (payload.postId) {
      postLike = await models.PostLikes.find({
        postId: payload.postId,
        likedBy: userId,
        deletedAt: null,
      });
      if (postLike.length) {
        postLike = postLike[0];
        postLike.deletedAt = new Date();
        postLike.save();
      } else {
        postLike = await models.PostLikes.create({
          postId: payload.postId,
          likedBy: userId,
        });
        postLike.save();
        await sendPostLikedMessageToKafka({ type: "post", likeDetails: postLike });
      }
    }
    return postLike;
  } catch (error) {
    console.log(error);
  }
};

const createOrUpdateCommentLike = async (payload, userId) => {
  try {
    let commentLike;
    if (payload.commentId) {
      commentLike = await models.CommentLikes.find({
        commentId: payload.commentId,
        likedBy: userId,
        deletedAt: null,
      });
      if (commentLike.length) {
        commentLike = commentLike[0];
        commentLike.deletedAt = new Date();
        commentLike.save();
      } else {
        commentLike = await models.CommentLikes.create({
          commentId: payload.commentId,
          likedBy: userId,
        });
        commentLike.save();
        await sendCommentLikedMessageToKafka({
          type: "comment",
          likeDetails: commentLike,
        });
      }
    }
    return commentLike;
  } catch (error) {
    console.log(error);
  }
};

const peopleRecommendation = async (userId) => {
  try {
    const connections = await models.Users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: "userconnections",
          localField: "_id",
          foreignField: "follower",
          as: "connections",
        },
      },
      {
        $addFields: {
          connections: {
            $filter: {
              input: "$connections",
              as: "connection",
              cond: {
                $eq: ["$$connection.deletedAt", null],
              },
            },
          },
        },
      },
      {
        $project: {
          id: 1,
          connections: {
            following: 1,
          },
        },
      },
    ]);
    let connectedPerson =
      connections[0]?.connections.map((connection) => connection.following) ||
      [];
    connectedPerson.push(userId);
    let availablePersons = await models.Users.find(
      { _id: { $nin: connectedPerson }, deletedAt: null },
      { _id: 1, firstName: 1, lastName: 1, bio: 1, color:1 },
      { limit: 5, sort: { createdAt: -1 } }
    );
    return availablePersons;
  } catch (error) {
    throw error;
  }
};

const getPostsComment = async (payload, postId, userId) => {
  try {
    let pageNumber = +payload.page || 1;
    let pageSize = +payload.pageSize || 10;
    let comments = await models.PostComments.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "commentedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          _id: 1,
          comment: 1,
          createdAt: 1,
          user: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            color: 1,
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]);
    let cms = []
    for await (const comment of comments) {
      let isUserLiked = await models.CommentLikes.findOne({likedBy:  new mongoose.Types.ObjectId(userId), commentId:comment?._id,deletedAt: null});
      cms.push ({...comment, isUserLiked: !!(isUserLiked)})
    }
    return cms;
  } catch (error) {
    throw error;
  }
};
const getPostDetails = async (postId) => {
    try {
      if (!postId) throw new Error(`Empty Post ID: ${postId}`);
      const postDetails = await models.Posts.findOne({
        _id: postId,
        deletedAt: null,
      });
      if (!postDetails) throw new Error(`Post not found: ${postId}`);
      const postedByUser = await models.Users.findOne({
        _id: postDetails.postedBy,
      });
      if (!postedByUser) throw new Error(`PostedByUser not found: ${postId}`);

      return {
        postId: postDetails?._id,
        postedByUserId: postedByUser?._id,
        firstName: postedByUser?.firstName,
        lastName: postedByUser?.lastName,
      }
    } catch (error) {
      console.log(error);
      return { error };
    }
  };
const specificPostDetails = async (postId, userId) => {
  try {
    if (!postId) throw new Error(`Empty Post ID: ${postId}`);
    const postDetails = await models.Posts.findOne({
      _id: postId,
      deletedAt: null,
    });
    if (!postDetails) throw new Error(`Post not found: ${postId}`);
    const postedByUser = await models.Users.findOne({
      _id: postDetails.postedBy,
    });
    if (!postedByUser) throw new Error(`PostedByUser not found: ${postId}`);
    const posts = await models.Posts.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(postId),
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
      ]);
    return posts?.length ? posts[0]: [];
  } catch (error) {
    console.log(error);
    return { error };
  }
};
const specificCommentDetails = async (commentId) => {
  try {
    if (!commentId) throw new Error(`Empty Comment ID: ${commentId}`);
    const commentDetails = await models.PostComments.findOne({
      _id: commentId,
      deletedAt: null,
    });
    if (!commentDetails) throw new Error(`Comment not found: ${commentId}`);
    const commentedByUser = await models.Users.findOne({
      _id: commentDetails.commentedBy,
    });
    if (!commentedByUser)
      throw new Error(`CommentedByUser not found: ${postId}`);
    return {
      commentedByUser: {
        id: commentedByUser._id,
        firstName: commentedByUser.firstName,
        lastName: commentedByUser.lastName,
        color: commentedByUser.color
      },
      commentDetails: {
        id: commentDetails._id,
        _id: commentDetails._id,
        comment: commentDetails.comment,
        createdAt: commentDetails.createdAt,
        postId: commentDetails.postId,
      },
    };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const insertNonSendUserList = async (
  resourceType,
  resourceId,
  userList,
  resObject
) => {
  try {
    if (
      ["posts", "comment", "postLike", "commentLike", "follow"].includes(
        resourceType
      )
    ) {
      for await (const userId of userList) {
        const record = await models.NonSendUsersList.create({
          resourceType: resourceType,
          resourceId: resourceId,
          toUserId: userId,
          metaData: JSON.stringify(resObject),
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getNonSendUserData = async (userId) => {
  try {
    const nonSendUsersList = await models.NonSendUsersList.find({
      toUserId: userId,
      deletedAt: null,
    });
    const result = nonSendUsersList.reduce((acc, obj) => {
        const key = obj.resourceType;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});
    return result;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createOrUpdatePost,
  createOrUpdateComment,
  createOrUpdateLike,
  createOrUpdateCommentLike,
  getAllUserPosts,
  getLatestPosts,
  getTrendingPosts,
  deletePost,
  peopleRecommendation,
  getPostsComment,
  specificPostDetails,
  insertNonSendUserList,
  specificCommentDetails,
  getNonSendUserData,
  sendPostCreatedMessageToKafka,
  sendCommentLikedMessageToKafka,
  sendPostLikedMessageToKafka,
  sendPostCommentedMessageToKafka,
  getPostDetails,
  deleteComment
};
