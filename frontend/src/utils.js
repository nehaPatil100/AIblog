export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const readTime = (text = '') => Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));
