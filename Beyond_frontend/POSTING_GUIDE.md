# ✍️ How to Publish a New Research Post

The blog is set up to load content dynamically. To publish a new post, follow these **two simple steps**:

## Step 1: Create the Content File
Create a new Markdown (`.md`) file in the folder: `public/content/`.
The name of the file will be the **slug** (the URL part).
> Example: If you want the URL to be `/post/my-new-research`, name the file `my-new-research.md`.

In this file, just write your blog post. You can use:
- **LaTeX** for math: `$$ E = mc^2 $$`
- **Code blocks**: Use triple backticks
- **Images**: See Step 3 below

## Step 2: Register the Post
Open `src/data/posts.js` and add an entry to the `posts` array.
> **IMPORTANT**: The `id` clearly must match the filename you created in Step 1.

```javascript
{
  id: 'my-new-research', // Must match public/content/my-new-research.md
  title: 'My Professional Research Title',
  subtitle: 'A short summary of the experiment.',
  date: 'February 2, 2026',
  readTime: '10 min read',
  category: 'Experiments', // Categories: Research, Experiments, Notes, Papers
  image: '/assets/diagrams/diagram1.png', // Main image for the card
  excerpt: 'A short teaser for the homepage list.'
}
```

## Step 3: Handling Images (Optional)
If you have technical diagrams:
1. Place them in `public/assets/diagrams/`.
2. Reference them in your Markdown like this: `![Alt Text](/assets/diagrams/my-image.png)`

---
### Workflow Summary
1. 📂 **public/content/slug.md** (Write your post)
2. 📝 **src/data/posts.js** (Add metadata)

*BeyondEmbeddings — Grounded in system behavior and practical research.*
