import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import PostRow from '../components/PostRow';
import Spinner from '../components/Spinner';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const tag = params.get('tag') || '';
  const [search, setSearch] = useState(q);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (p) => {
    const { data } = await api.get('/posts', { params: { page: p, limit: 6, q, tag } });
    return data;
  }, [q, tag]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPage(1)
      .then((d) => { setPosts(d.posts); setPage(1); setHasMore(d.hasMore); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await fetchPage(page + 1);
      setPosts((prev) => [...prev, ...d.posts]);
      setPage(page + 1);
      setHasMore(d.hasMore);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (search.trim()) next.q = search.trim();
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Stories from students and builders.
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Write in Markdown, get ideas and drafts from AI, and publish with one click.
      </p>

      <form onSubmit={submit} className="mt-8 flex gap-2" role="search">
        <input className="input" placeholder="Search posts by title or tag" value={search}
          onChange={(e) => setSearch(e.target.value)} aria-label="Search posts" />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {(q || tag) && (
        <p className="mt-4 text-sm text-muted">
          Showing results for <strong className="text-ink">{q || `#${tag}`}</strong>{' '}
          <button className="text-brand underline" onClick={() => { setSearch(''); setParams({}); }}>Clear</button>
        </p>
      )}

      <div className="mt-10">
        {loading ? <Spinner /> : error ? (
          <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl">No posts yet</p>
            <p className="mt-2 text-sm text-muted">Pehla post publish karne wale tum bano.</p>
          </div>
        ) : (
          <>
            {posts.map((p) => <PostRow key={p._id} post={p} />)}
            {hasMore && (
              <div className="pt-8 text-center">
                <button className="btn btn-outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load more posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
