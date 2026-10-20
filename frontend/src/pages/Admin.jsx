import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import { formatDate } from '../utils';

export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, u, p] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/posts')]);
      setStats(s.data); setUsers(u.data.users); setPosts(p.data.posts);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const delUser = async (u) => {
    if (!window.confirm(`${u.name} aur uske saare posts delete karne hain?`)) return;
    try { await api.delete(`/admin/users/${u.id}`); toast('User deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const delPost = async (p) => {
    if (!window.confirm(`"${p.title}" delete karna hai?`)) return;
    try { await api.delete(`/posts/${p._id}`); toast('Post deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  if (loading) return <Spinner />;

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === id ? 'border-brand text-brand-dark' : 'border-transparent text-muted hover:text-ink'}`}>
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold">Admin</h1>
      <dl className="mt-6 grid grid-cols-2 gap-6 border-y border-line py-5 sm:grid-cols-4">
        {[['Users', stats.users], ['Posts', stats.posts], ['Published', stats.published], ['Drafts', stats.drafts]].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="font-serif text-3xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex border-b border-line">{tabBtn('users', 'Users')}{tabBtn('posts', 'All posts')}</div>

      <div className="overflow-x-auto">
        {tab === 'users' ? (
          <table className="mt-2 w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="py-3 font-medium">Name</th><th className="font-medium">Email</th><th className="font-medium">Role</th><th className="font-medium">Posts</th><th className="font-medium">Joined</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="py-3 font-medium">{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.posts}</td><td>{formatDate(u.createdAt)}</td>
                  <td className="text-right"><button className="text-xs text-red-600 hover:underline" onClick={() => delUser(u)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="mt-2 w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="py-3 font-medium">Title</th><th className="font-medium">Author</th><th className="font-medium">Status</th><th className="font-medium">Created</th><th /></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="border-t border-line">
                  <td className="max-w-xs truncate py-3 font-medium"><Link to={`/post/${p.slug}`} className="hover:text-brand">{p.title}</Link></td>
                  <td>{p.author?.name}</td><td>{p.status}</td><td>{formatDate(p.createdAt)}</td>
                  <td className="text-right"><button className="text-xs text-red-600 hover:underline" onClick={() => delPost(p)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
