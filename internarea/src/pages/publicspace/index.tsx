import { useEffect, useState } from 'react';
import axios from 'axios';

interface Post {
  _id: string;
  userId: string;
  caption: string;
  mediaUrl: string;
  createdAt: string;
  likes?: number;
}

interface User {
  _id: string;
  email: string;
}

interface Comment {
  _id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [postRes, userRes] = await Promise.all([
          axios.get<Post[]>('http://localhost:5000/api/post'),
          axios.get<User[]>('http://localhost:5000/api/auth/users'),
        ]);

        const userMap: Record<string, string> = {};
        userRes.data.forEach((user) => {
          userMap[user._id] = user.email;
        });

        const commentsByPost: Record<string, Comment[]> = {};
        await Promise.all(
          postRes.data.map(async (post) => {
            const res = await axios.get<Comment[]>(
              `http://localhost:5000/api/post/${post._id}/comments`
            );
            commentsByPost[post._id] = res.data || [];
          })
        );

        setUserMap(userMap);
        setPosts(postRes.data);
        setCommentsMap(commentsByPost);
      } catch (err) {
        console.error('Failed to fetch posts/users/comments', err);
        setError('❌ Unable to load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/post/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
        )
      );
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    try {
      const userRes = await axios.get(`http://localhost:5000/api/auth/user-id?email=${currentUserEmail}`);
      const userId = userRes.data.userId;

      const res = await axios.post(`http://localhost:5000/api/post/${postId}/comment`, {
        text: commentText,
        userId,
      });

      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data.comment],
      }));
      setNewComments((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to submit comment', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🌐 Public Space Feed</h2>

        {loading ? (
          <p className="text-gray-600">Loading posts...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No posts found.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">👤 User:</span> {userMap[post.userId] || post.userId}
              </p>
              <p className="text-gray-800 mb-3">
                <span className="font-semibold">📝 Caption:</span> {post.caption}
              </p>

              {post.mediaUrl.endsWith('.mp4') ? (
                <video controls className="w-full rounded-md mb-3">
                  <source src={post.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={post.mediaUrl} alt="Post media" className="w-full rounded-md mb-3" />
              )}

              <p className="text-xs text-gray-500 mb-2">
                📅 Posted on: {new Date(post.createdAt).toLocaleString()}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  ❤️ Like ({post.likes || 0})
                </button>
              </div>

              {/* Comments */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">💬 Comments</h4>
                {commentsMap[post._id]?.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-100 p-2 rounded mb-2 text-sm"
                  >
                    <span className="font-medium">
                      {userMap[comment.userId] || 'Unknown'}:
                    </span>{' '}
                    {comment.text}
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}

                <div className="flex mt-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComments[post._id] || ''}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    className="flex-1 p-2 rounded-l border"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post._id)}
                    className="bg-blue-500 text-white px-4 rounded-r"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
