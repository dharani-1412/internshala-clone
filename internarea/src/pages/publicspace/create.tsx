import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setMessage("⚠️ Please log in first to create a post.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/auth/user-id?email=${email}`)
      .then((res) => {
        if (res.data.userId) {
          setUserId(res.data.userId);
        } else {
          setMessage("❌ No user found for this email.");
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("❌ Failed to fetch user ID.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/post/create', {
        caption,
        mediaUrl,
        userId,
      });
      setMessage('✅ Post created successfully!');
      setCaption('');
      setMediaUrl('');
      console.log(res.data);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.message || '❌ Failed to post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">📝 Create a Post</h2>

        {loading ? (
          <p className="text-gray-600">🔄 Loading user...</p>
        ) : userId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Enter Media URL (image/video)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={userId}
              readOnly
              placeholder="User ID (auto-filled)"
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 text-gray-500 cursor-not-allowed"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
            >
              🚀 Upload Post
            </button>
          </form>
        ) : (
          <p className="text-yellow-600 text-center font-medium">⚠️ Please log in first to create a post.</p>
        )}

        {message && (
          <p
            className={`mt-4 text-center font-semibold ${
              message.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
