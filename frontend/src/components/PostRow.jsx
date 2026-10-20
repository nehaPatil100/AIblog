import { Link } from 'react-router-dom';
import { imgUrl } from '../api';
import { formatDate } from '../utils';

export default function PostRow({ post }) {
  return (
    <article className="flex gap-5 border-b border-line py-7 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs text-muted">
          {post.author?.name} &middot; {formatDate(post.publishedAt || post.createdAt)}
        </p>
        <h2 className="font-serif text-2xl font-semibold leading-snug tracking-tight">
          <Link to={`/post/${post.slug}`} className="hover:text-brand">{post.title}</Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{post.summary || post.excerpt}</p>
        {post.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t} to={`/?tag=${encodeURIComponent(t)}`} className="badge bg-brand-soft text-brand-dark hover:bg-brand hover:text-white">
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>
      {post.coverImage && (
        <Link to={`/post/${post.slug}`} className="hidden shrink-0 sm:block" tabIndex={-1} aria-hidden="true">
          <img src={imgUrl(post.coverImage)} alt="" className="h-28 w-40 rounded-md object-cover" loading="lazy" />
        </Link>
      )}
    </article>
  );
}
