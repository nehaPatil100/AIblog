import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, imgUrl } from '../api';
import { useToast } from '../context/ToastContext';
import AIPanel from '../components/AIPanel';
import MarkdownView from '../components/MarkdownView';
import Spinner from '../components/Spinner';

const EMPTY = { title: '', content: '', summary: '', coverImage: '', tags: '', status: 'draft' };

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const taRef = useRef(null);

  const [postId, setPostId] = useState(id || null);
  const [slug, setSlug] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summing, setSumming] = useState(false);
  const [mode, setMode] = useState('split');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    api.get(`/posts/id/${id}`)
      .then(({ data }) => {
        const p = data.post;
        setForm({ title: p.title, content: p.content, summary: p.summary, coverImage: p.coverImage, tags: (p.tags || []).join(', '), status: p.status });
        setSlug(p.slug);
        setPostId(p._id);
      })
      .catch((e) => { toast(errMsg(e), 'error'); nav('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Markdown toolbar helpers ----------
  const edit = (fn) => {
    const el = taRef.current;
    const { text, selStart, selEnd } = fn(form.content, el.selectionStart, el.selectionEnd);
    set('content', text);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(selStart, selEnd); });
  };
  const wrap = (before, after = before, placeholder = 'text') =>
    edit((t, s, e) => {
      const sel = t.slice(s, e) || placeholder;
      return { text: t.slice(0, s) + before + sel + after + t.slice(e), selStart: s + before.length, selEnd: s + before.length + sel.length };
    });
  const linePrefix = (p) =>
    edit((t, s, e) => {
      const ls = s === 0 ? 0 : t.lastIndexOf('\n', s - 1) + 1;
      return { text: t.slice(0, ls) + p + t.slice(ls), selStart: s + p.length, selEnd: e + p.length };
    });
  const codeBlock = () =>
    edit((t, s, e) => {
      const sel = t.slice(s, e) || 'code here';
      const b = '\n```js\n';
      return { text: t.slice(0, s) + b + sel + '\n```\n' + t.slice(e), selStart: s + b.length, selEnd: s + b.length + sel.length };
    });

  const TOOLS = [
    ['B', 'Bold', () => wrap('**')],
    ['I', 'Italic', () => wrap('*')],
    ['H2', 'Heading 2', () => linePrefix('## ')],
    ['H3', 'Heading 3', () => linePrefix('### ')],
    ['Quote', 'Quote', () => linePrefix('> ')],
    ['List', 'Bullet list', () => linePrefix('- ')],
    ['Code', 'Inline code', () => wrap('`', '`', 'code')],
    ['Block', 'Code block', codeBlock],
    ['Link', 'Link', () => wrap('[', '](https://)', 'link text')],
  ];

  // ---------- Actions ----------
  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', fd);
      set('coverImage', data.url);
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const makeSummary = async () => {
    setSumming(true);
    try {
      const { data } = await api.post('/ai/summary', { content: form.content });
      set('summary', data.summary);
      toast('Summary ready. Review karke save karo.');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setSumming(false);
    }
  };

  const onGenerated = ({ title, content }) => {
    const body = content.replace(/^#\s+.+\n+/, ''); // title alag field mein hai
    setForm((f) => ({ ...f, content: body, title: f.title.trim() ? f.title : title }));
  };

  const save = async (status) => {
    if (!form.title.trim()) return toast('Title zaroori hai', 'error');
    if (status === 'published' && form.content.trim().length < 20) return toast('Publish karne se pehle thoda content likho', 'error');
    setSaving(true);
    try {
      const payload = { ...form, status };
      const { data } = postId ? await api.put(`/posts/${postId}`, payload) : await api.post('/posts', payload);
      const p = data.post;
      if (status === 'published') {
        toast('Published');
        nav(`/post/${p.slug}`);
      } else if (!postId) {
        toast('Draft saved');
        nav(`/editor/${p._id}`, { replace: true });
      } else {
        setSlug(p.slug);
        set('status', p.status);
        toast(status === 'draft' ? 'Draft saved' : 'Changes saved');
      }
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const isPublished = form.status === 'published';
  const modeBtn = (m, label) => (
    <button type="button" onClick={() => setMode(m)}
      className={`rounded px-3 py-1 text-xs font-medium ${mode === m ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
      {label}
    </button>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className={`badge mr-2 ${isPublished ? 'bg-brand-soft text-brand-dark' : 'bg-ai-soft text-ai'}`}>{form.status}</span>
            {postId ? 'Editing post' : 'New post'}
            {slug && isPublished && <> &middot; <Link to={`/post/${slug}`} className="text-brand">View live</Link></>}
          </p>
          <div className="flex gap-2">
            {isPublished ? (
              <>
                <button className="btn btn-outline" disabled={saving} onClick={() => save('draft')}>Move to drafts</button>
                <button className="btn btn-primary" disabled={saving} onClick={() => save('published')}>{saving ? 'Saving...' : 'Update post'}</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" disabled={saving} onClick={() => save('draft')}>{saving ? 'Saving...' : 'Save draft'}</button>
                <button className="btn btn-primary" disabled={saving} onClick={() => save('published')}>Publish</button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="sr-only" htmlFor="title">Title</label>
          <input id="title" maxLength={150} placeholder="Post title" value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full border-0 border-b border-line bg-transparent pb-3 font-serif text-4xl font-semibold tracking-tight placeholder:text-muted/50 focus:border-brand focus:outline-none" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="label">Cover image</span>
            {form.coverImage ? (
              <div>
                <img src={imgUrl(form.coverImage)} alt="Cover preview" className="h-32 w-full rounded-md object-cover" />
                <button type="button" className="mt-2 text-xs text-red-600 underline" onClick={() => set('coverImage', '')}>Remove cover</button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line bg-white text-sm text-muted hover:border-brand">
                {uploading ? 'Uploading...' : 'Click to upload (JPG, PNG, WEBP, max 3MB)'}
                <input type="file" accept="image/*" className="sr-only" onChange={onUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <div>
            <label className="label" htmlFor="tags">Tags</label>
            <input id="tags" className="input" placeholder="react, nodejs, beginner" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            <p className="mt-1 text-xs text-muted">Comma se alag karo (max 8).</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Markdown formatting">
              {TOOLS.map(([label, title, fn]) => (
                <button key={label} type="button" title={title} aria-label={title} onClick={fn}
                  disabled={mode === 'preview'}
                  className="rounded border border-line bg-white px-2 py-1 text-xs font-medium hover:bg-brand-soft disabled:opacity-40">
                  {label}
                </button>
              ))}
            </div>
            <div className="flex rounded border border-line bg-white p-0.5">
              {modeBtn('write', 'Write')}{modeBtn('split', 'Split')}{modeBtn('preview', 'Preview')}
            </div>
          </div>
          <div className={`grid gap-4 ${mode === 'split' ? 'md:grid-cols-2' : ''}`}>
            {mode !== 'preview' && (
              <textarea ref={taRef} value={form.content} onChange={(e) => set('content', e.target.value)}
                aria-label="Markdown content" spellCheck
                placeholder={'Write in Markdown...\n\n## Heading\nSome **bold** text and a code block:\n```js\nconsole.log("hello");\n```'}
                className="h-[540px] w-full resize-y rounded-md border border-line bg-white p-4 font-mono text-sm leading-relaxed focus:border-brand focus:outline-none" />
            )}
            {mode !== 'write' && (
              <div className="h-[540px] overflow-auto rounded-md border border-line bg-white p-5">
                {form.content.trim()
                  ? <MarkdownView content={form.content} />
                  : <p className="text-sm text-muted">Preview yahan dikhega.</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label !mb-0" htmlFor="summary">Summary</label>
            <button type="button" className="btn btn-ai btn-sm" onClick={makeSummary} disabled={summing || form.content.trim().length < 50}>
              {summing ? 'Summarizing...' : 'Generate with AI'}
            </button>
          </div>
          <textarea id="summary" rows={3} maxLength={500} className="input" value={form.summary}
            placeholder="2-3 line summary (post ke upar dikhega). Khud likho ya AI se banwao."
            onChange={(e) => set('summary', e.target.value)} />
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <AIPanel hasContent={form.content.trim().length > 0} onGenerated={onGenerated}
          onIdea={(t) => setForm((f) => (f.title.trim() ? f : { ...f, title: t }))} />
      </div>
    </div>
  );
}
