// pages/publicspace/[postId].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import axios from 'axios';

interface Post {
  _id: string;
  userId: string;
  caption: string;
  mediaUrl: string;
  createdAt: string;
}

interface PostPageProps {
  post: Post;
}

export default function PostDetailPage({ post }: PostPageProps) {
  if (!post) {
    return <div style={{ padding: '2rem' }}>❌ Post not found</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2 className="text-xl font-semibold mb-4">🧾 Post Detail</h2>
      <p><strong>Caption:</strong> {post.caption}</p>
      {post.mediaUrl.endsWith('.mp4') ? (
        <video controls width="100%" className="rounded mt-2">
          <source src={post.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <img src={post.mediaUrl} alt="media" className="rounded mt-2 w-full" />
      )}
      <p className="text-sm mt-3 text-gray-600">🕒 Posted on: {new Date(post.createdAt).toLocaleString()}</p>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/post');
    const posts: Post[] = res.data;

    const paths = posts.map((post) => ({
      params: { postId: post._id },
    }));

    return { paths, fallback: false };
  } catch (err) {
    console.error('Error fetching posts for paths:', err);
    return { paths: [], fallback: false };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/post/${params?.postId}`);
    const post: Post = res.data;

    return {
      props: { post },
    };
  } catch (err) {
    console.error('Error fetching post data:', err);
    return {
      notFound: true,
    };
  }
};
