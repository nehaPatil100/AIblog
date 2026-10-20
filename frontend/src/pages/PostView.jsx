import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg, imgUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import MarkdownView from '../components/MarkdownView';
import ShareButtons from '../components/ShareButtons';
import Spinner from '../components/Spinner';
import { formatDate, readTime } from '../utils';

export default function PostView() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    window.scrollTo(0, 0);
    api.get(`/posts/slug/${slug}`)
      .then((r) => { setPost(r.data.post); document.title = `${r.data.post.title} - Inkwell`; })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
    return () => { document.title = 'Inkwell - AI Blog Platform'; };
  }, [slug]);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Post not found</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Link to="/" className="btn btn-primary mt-6">Back to Explore</Link>
      </div>
    );
  }

  const canEdit = user && (String(user.id) === String(post.author?._id) || user.role === 'admin');

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {post.status === 'draft' && (
        <p className="mb-6 rounded-md bg-ai-soft px-4 py-3 text-sm text-ai">
          Ye draft hai. Sirf tum ise dekh sakte ho jab tak publish nahi karte.
        </p>
      )}
      <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span className="font-medium text-ink">{post.author?.name}</span>
        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        <span>{readTime(post.content)} min read</span>
        {canEdit && <Link to={`/editor/${post._id}`} className="font-medium text-brand">Edit post</Link>}
      </div>

      {post.coverImage && (
        <img src={imgUrl(post.coverImage)} alt="" className="mt-8 max-h-[420px] w-full rounded-md object-cover" />
      )}

      {post.summary && (
        <div className="mt-8 border-l-4 border-ai bg-ai-soft/60 px-4 py-3">
          <p className="text-xs font-bold text-ai">Summary</p>
          <p className="mt-1 text-[15px] leading-relaxed">{post.summary}</p>
        </div>
      )}

      <MarkdownView content={post.content} className="prose-lg mt-8" />

      {post.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link key={t} to={`/?tag=${encodeURIComponent(t)}`} className="badge bg-brand-soft text-brand-dark">{t}</Link>
          ))}
        </div>
      )}

      {post.status === 'published' && (
        <div className="mt-8 border-t border-line pt-6">
          <ShareButtons slug={post.slug} title={post.title} />
        </div>
      )}

      {post.author?.bio && (
        <div className="mt-8 border-t border-line pt-6 text-sm">
          <p className="font-medium">Written by {post.author.name}</p>
          <p className="mt-1 text-muted">{post.author.bio}</p>
        </div>
      )}
    </article>
  );
}
