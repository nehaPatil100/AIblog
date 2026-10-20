import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function MarkdownView({ content, className = '' }) {
  return (
    <div className={`prose prose-slate font-serif prose-headings:font-sans prose-headings:tracking-tight prose-a:text-brand prose-img:rounded-md ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
