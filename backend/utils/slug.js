import slugify from 'slugify';

export async function uniqueSlug(Post, title, excludeId) {
  const base = slugify(title, { lower: true, strict: true }) || 'post';
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Post.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}
