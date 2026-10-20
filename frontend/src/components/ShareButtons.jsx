import { useToast } from '../context/ToastContext';

export default function ShareButtons({ slug, title }) {
  const toast = useToast();
  const url = `${window.location.origin}/post/${slug}`;
  const enc = encodeURIComponent;

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* user cancelled */
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copy ho gaya');
    } catch {
      toast('Copy nahi hua, link manually copy karo', 'error');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted">Share</span>
      {navigator.share && <button className="btn btn-outline btn-sm" onClick={nativeShare}>Share...</button>}
      <button className="btn btn-outline btn-sm" onClick={copy}>Copy link</button>
      <a className="btn btn-outline btn-sm" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${enc(`${title} ${url}`)}`}>WhatsApp</a>
      <a className="btn btn-outline btn-sm" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}>X</a>
      <a className="btn btn-outline btn-sm" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}>LinkedIn</a>
    </div>
  );
}
