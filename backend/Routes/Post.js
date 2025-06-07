// backend/Routes/post.js
const express = require('express');
const router = express.Router();
const Post = require('../Model/Post');
const Comment = require('../Model/comment');
const { canUserPostToday } = require('../lib/postLimit');

// ✅ Create a new post
router.post('/create', async (req, res) => {
  try {
    const { userId, mediaUrl, caption } = req.body;
    if (!userId || !mediaUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const canPost = await canUserPostToday(userId);
    if (!canPost) {
      return res.status(403).json({ message: "Post limit reached for today." });
    }

    const newPost = new Post({ userId, mediaUrl, caption, createdAt: new Date() });
    await newPost.save();

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// POST /api/post/:postId/like
router.post('/:postId/like', async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.likes = (post.likes || 0) + 1;
    await post.save();

    res.status(200).json({ message: '👍 Post liked', likes: post.likes });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error getting posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add comment to post
router.post('/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ message: 'Missing userId or text' });
  }

  try {
    const comment = new Comment({ postId, userId, text });
    await comment.save();
    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// backend/Routes/post.js
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
