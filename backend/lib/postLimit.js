const Post = require('../Model/Post');
const Friend = require('../Model/Friend');

async function canUserPostToday(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const postCount = await Post.countDocuments({
    userId,
    createdAt: { $gte: today }
  });

  const friendCount = await Friend.countDocuments({
    $or: [
      { user1: userId },
      { user2: userId }
    ]
  });

  if (friendCount >= 10) return true;

  const allowedPosts = friendCount >= 2 ? 2 : 1;
  return postCount < allowedPosts;
}

module.exports = { canUserPostToday };
