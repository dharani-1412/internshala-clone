import { useRouter } from 'next/router';

export default function PostDetailPage() {
  const router = useRouter();
  const { postId } = router.query;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧾 Post Detail</h2>
      <p>Post ID: {postId}</p>
      {/* You can load the full post here later */}
    </div>
  );
}
