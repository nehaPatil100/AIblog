import { useState } from 'react';
import api, { errMsg } from '../api';
import { useToast } from '../context/ToastContext';

const TONES = ['friendly', 'professional', 'casual', 'educational', 'persuasive'];
const LENGTHS = [['short', 'Short (~400)'], ['medium', 'Medium (~800)'], ['long', 'Long (~1200)']];

export default function AIPanel({ hasContent, onGenerated, onIdea }) {
  const toast = useToast();
  const [tab, setTab] = useState('ideas');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('friendly');
  const [length, setLength] = useState('medium');
  const [ideaTopic, setIdeaTopic] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [busy, setBusy] = useState(false);

  const getIdeas = async () => {
    if (!ideaTopic.trim()) return toast('Topic ya category likho', 'error');
    setBusy(true);
    try {
      const { data } = await api.post('/ai/ideas', { topic: ideaTopic });
      setIdeas(data.ideas);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    if (!topic.trim()) return toast('Pehle topic likho', 'error');
    if (hasContent && !window.confirm('Editor ka current content replace ho jayega. Continue?')) return;
    setBusy(true);
    try {
      const { data } = await api.post('/ai/generate', { topic, tone, length });
      onGenerated(data);
      toast('Blog ready hai. Ab review karke edit karo.');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const useIdea = (idea) => {
    setTopic(idea.description ? `${idea.title} - ${idea.description}` : idea.title);
    setTab('generate');
    onIdea(idea.title);
  };

  const tabBtn = (id, text) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 border-b-2 px-3 py-2 text-sm font-medium ${tab === id ? 'border-ai text-ai' : 'border-transparent text-muted hover:text-ink'}`}
    >
      {text}
    </button>
  );

  return (
    <aside className="rounded-md border border-line bg-white">
      <div className="border-b border-line bg-ai-soft/60 px-4 py-3">
        <h2 className="text-sm font-bold text-ai">AI writing assistant</h2>
        <p className="mt-0.5 text-xs text-muted">Output ko hamesha review karke publish karo.</p>
      </div>
      <div className="flex border-b border-line">{tabBtn('ideas', 'Find ideas')}{tabBtn('generate', 'Write post')}</div>

      <div className="space-y-3 p-4">
        {tab === 'ideas' ? (
          <>
            <div>
              <label className="label" htmlFor="idea-topic">Topic or category</label>
              <input id="idea-topic" className="input" value={ideaTopic} placeholder="e.g. React for beginners"
                onChange={(e) => setIdeaTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && getIdeas()} />
            </div>
            <button className="btn btn-ai w-full" onClick={getIdeas} disabled={busy}>
              {busy ? 'Thinking...' : 'Get blog ideas'}
            </button>
            <ul className="space-y-2">
              {ideas.map((idea, i) => (
                <li key={i} className="rounded-md border border-line p-3">
                  <p className="text-sm font-medium leading-snug">{idea.title}</p>
                  <p className="mt-1 text-xs text-muted">{idea.description}</p>
                  <button className="mt-2 text-xs font-medium text-brand hover:underline" onClick={() => useIdea(idea)}>
                    Use this idea
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="gen-topic">What should the post be about?</label>
              <textarea id="gen-topic" rows={3} className="input" value={topic}
                placeholder="e.g. How JWT authentication works in Node.js"
                onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="tone">Tone</label>
                <select id="tone" className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="len">Length</label>
                <select id="len" className="input" value={length} onChange={(e) => setLength(e.target.value)}>
                  {LENGTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-ai w-full" onClick={generate} disabled={busy}>
              {busy ? 'Writing... (10-20 sec)' : 'Generate blog post'}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
