import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, imgUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import { formatDate } from '../utils';

const TABS = [['', 'All', 'all'], ['draft', 'Drafts', 'draft'], ['published', 'Published', 'published']];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({ all: 0, draft: 0, published: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    (p) => api.get('/posts/mine', { params: { page: p, limit: 8, status } }).then((r) => r.data),
    [status]
  );

  const reload = useCallback(() => {
    setLoading(true);
    fetchPage(1)
      .then((d) => { setPosts(d.posts); setCounts(d.counts); setPage(1); setHasMore(d.hasMore); })
      .catch((e) => toast(errMsg(e), 'error'))
      .finally(() => setLoading(false));
  }, [fetchPage, toast]);

  useEffect(() => { reload(); }, [reload]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await fetchPage(page + 1);
      setPosts((p) => [...p, ...d.posts]);
      setPage(page + 1);
      setHasMore(d.hasMore);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const setPostStatus = async (post, next) => {
    try {
      await api.patch(`/posts/${post._id}/status`, { status: next });
      toast(next === 'published' ? 'Published' : 'Moved to drafts');
      reload();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`"${post.title}" delete karna hai? Ye wapas nahi aayega.`)) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast('Post deleted');
      reload();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Your posts</h1>
          <p className="mt-1 text-sm text-muted">Hi {user.name.split(' ')[0]}, yahan se apne saare blogs manage karo.</p>
        </div>
        <Link to="/editor" className="btn btn-primary">Write a post</Link>
      </div>

      <div className="mt-8 flex gap-1 border-b border-line" role="tablist">
        {TABS.map(([val, label, key]) => (
          <button key={key} role="tab" aria-selected={status === val} onClick={() => setStatus(val)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${status === val ? 'border-brand text-brand-dark' : 'border-transparent text-muted hover:text-ink'}`}>
            {label} <span className="ml-1 text-xs text-muted">{counts[key]}</span>
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">{status ? `No ${status} posts` : 'Nothing written yet'}</p>
          <p className="mt-2 text-sm text-muted">Naya post shuru karo, AI se idea bhi le sakte ho.</p>
          <Link to="/editor" className="btn btn-primary mt-5">Write your first post</Link>
        </div>
      ) : (
        <ul>
          {posts.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center gap-4 border-b border-line py-4">
              {p.coverImage
                ? <img src={imgUrl(p.coverImage)} alt="" className="h-14 w-20 rounded object-cover" />
                : <div className="h-14 w-20 rounded bg-brand-soft" aria-hidden="true" />}
              <div className="min-w-0 flex-1">
                <Link to={`/editor/${p._id}`} className="block truncate font-medium hover:text-brand">{p.title}</Link>
                <p className="mt-0.5 text-xs text-muted">
                  <span className={`badge mr-2 ${p.status === 'published' ? 'bg-brand-soft text-brand-dark' : 'bg-ai-soft text-ai'}`}>{p.status}</span>
                  Updated {formatDate(p.updatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/post/${p.slug}`} className="btn btn-outline btn-sm">{p.status === 'draft' ? 'Preview' : 'View'}</Link>
                <Link to={`/editor/${p._id}`} className="btn btn-outline btn-sm">Edit</Link>
                {p.status === 'draft'
                  ? <button className="btn btn-primary btn-sm" onClick={() => setPostStatus(p, 'published')}>Publish</button>
                  : <button className="btn btn-outline btn-sm" onClick={() => setPostStatus(p, 'draft')}>Unpublish</button>}
                <button className="btn btn-sm text-red-600 hover:bg-red-50" onClick={() => remove(p)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="pt-8 text-center">
          <button className="btn btn-outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
