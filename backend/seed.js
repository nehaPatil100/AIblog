// Usage (backend folder ke andar):
//   node seed.js          -> 6 sample stories add karta hai
//   node seed.js --clear  -> sirf seed wale sample posts hata deta hai
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import { uniqueSlug } from './utils/slug.js';

const DEMO = { name: 'Inkwell Team', email: 'demo@inkwell.dev', password: 'demo12345', bio: 'Sample stories to get you started.' };

const excerpt = (md) =>
  md.replace(/~~~[\s\S]*?~~~/g, ' ').replace(/[#>*_`~[\]()!|-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);

const POSTS = [
  {
    title: 'React Hooks Explained for Beginners',
    tags: ['react', 'javascript', 'beginner'],
    summary: 'A quick tour of useState and useEffect, the two hooks you will use in almost every React component.',
    content: `Hooks let function components keep state and run side effects. You only need two of them to build most small apps.

## useState: remember a value

~~~js
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
~~~

When you call \`setCount\`, React re-renders the component with the new value.

## useEffect: run code after render

~~~js
useEffect(() => {
  document.title = 'Clicked ' + count + ' times';
}, [count]);
~~~

The array at the end is the dependency list. The effect runs again only when **count** changes.

## Rules to remember
- Call hooks only at the top level of a component.
- Never call them inside loops or if-statements.
- Name your own hooks with the *use* prefix.`,
  },
  {
    title: 'How JWT Authentication Works in Node.js',
    tags: ['nodejs', 'jwt', 'security'],
    summary: 'What a JSON Web Token is, how the server signs it, and how to protect an Express route with it.',
    content: `A JSON Web Token (JWT) is a signed string the server gives you after login. You send it back with every request to prove who you are.

## The flow
1. User logs in with email and password.
2. Server checks the password and signs a token with a secret.
3. Client stores the token and sends it in the **Authorization** header.
4. Server verifies the signature on each protected request.

## Signing and verifying

~~~js
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const payload = jwt.verify(token, process.env.JWT_SECRET);
~~~

## Good habits
- Keep the secret in a \`.env\` file, never in Git.
- Hash passwords with bcrypt before saving them.
- Use short expiry times for sensitive apps.`,
  },
  {
    title: '5 Study Habits That Actually Work for CS Students',
    tags: ['students', 'productivity', 'career'],
    summary: 'Simple routines that help you learn programming faster without burning out before exams.',
    content: `Computer science is a lot to learn. These habits helped many students stay consistent.

## 1. Build, do not just watch
Tutorials feel productive, but you learn more when you build a small project and get stuck on your own.

## 2. Code a little every day
Thirty focused minutes daily beats a six-hour session once a week.

## 3. Explain it out loud
If you can explain recursion to a friend, you really understand it. Try writing a short blog post about each new topic.

## 4. Keep a bug diary
Write down each bug and how you fixed it. You will see the same mistakes less often.

## 5. Rest on purpose
Sleep and breaks help your brain store what you studied. Plan them like you plan study time.`,
  },
  {
    title: 'MongoDB Schema Design: Embed or Reference?',
    tags: ['mongodb', 'database', 'backend'],
    summary: 'A simple rule of thumb for deciding whether related data belongs inside one document or in its own collection.',
    content: `The most common MongoDB question is whether to **embed** data or **reference** it.

## Embed when
- The child data is always read with the parent.
- The list stays small, like a few addresses on a user.

~~~js
{ name: 'Asha', addresses: [{ city: 'Mumbai' }, { city: 'Pune' }] }
~~~

## Reference when
- The child data grows without limit, like comments on a popular post.
- Many parents share the same child.

~~~js
// Post document
{ title: 'Hello', author: ObjectId('...') }
~~~

In this blog app, a post stores its author as a reference and uses \`populate\` to load the name when needed.

**Rule of thumb:** design the schema around how your app reads the data.`,
  },
  {
    title: 'Write Better Blog Posts with Markdown',
    tags: ['markdown', 'writing', 'blogging'],
    summary: 'The handful of Markdown symbols you need to format headings, lists, links and code in your posts.',
    content: `Markdown lets you format text while typing, without clicking toolbar buttons.

## The basics
- \`#\` for a heading, \`##\` for a smaller heading
- \`**bold**\` and \`*italic*\`
- \`-\` at the start of a line for a bullet list
- \`[text](https://example.com)\` for a link

## Quotes and code

> A good post says one thing clearly.

Use three tildes or backticks around a code block and add the language name for colors:

~~~python
def greet(name):
    return "Hello, " + name
~~~

## Writing tips
1. Start with a clear title.
2. Keep paragraphs short.
3. Use headings so readers can scan.
4. Preview before you publish.`,
  },
  {
    title: 'Git and GitHub Basics for Your First Team Project',
    tags: ['git', 'github', 'beginner'],
    summary: 'The six commands and one habit you need to collaborate on code without overwriting each other.',
    content: `Working in a team without Git gets messy fast. Here is the minimum you need.

## Everyday commands

~~~bash
git clone <repo-url>        # copy the project
git checkout -b my-feature  # create your own branch
git add .                   # stage your changes
git commit -m "Add login page"
git push origin my-feature  # upload your branch
git pull                    # get your teammates' work
~~~

## The one habit
Never commit directly to **main**. Make a branch, push it, and open a pull request so a teammate can review it.

## If you get a merge conflict
Git marks the clashing lines in the file. Pick the version you want, delete the markers, then commit again. It looks scary the first time, but it is only text editing.`,
  },
];

await mongoose.connect(process.env.MONGO_URI);

if (process.argv.includes('--clear')) {
  const u = await User.findOne({ email: DEMO.email });
  if (u) {
    const r = await Post.deleteMany({ author: u._id });
    console.log(`${r.deletedCount} sample posts delete ho gaye.`);
  } else {
    console.log('Koi sample data nahi mila.');
  }
} else {
  let author = await User.findOne({ email: DEMO.email });
  if (!author) author = await User.create(DEMO);

  let added = 0;
  for (let i = 0; i < POSTS.length; i += 1) {
    const p = POSTS[i];
    if (await Post.exists({ title: p.title, author: author._id })) continue;
    const when = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000); // har post 2 din purana
    await Post.create({
      ...p,
      excerpt: excerpt(p.content),
      slug: await uniqueSlug(Post, p.title),
      status: 'published',
      publishedAt: when,
      author: author._id,
    });
    added += 1;
  }
  console.log(`${added} sample posts add ho gaye. Home page refresh karo.`);
}

await mongoose.disconnect();