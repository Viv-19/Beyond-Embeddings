const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding new blog posts...');

    const post1 = await prisma.post.create({
        data: {
            type: 'blogs',
            title: 'From GPT-2 to GPT-OSS (2019 → 2025)',
            slug: 'from-gpt2-to-gpt-oss',
            subtitle: 'The Evolution of Transformers',
            excerpt: 'LLMs have advanced at an incredible pace—new breakthroughs every year. The backbone is still the transformer, but the real magic comes from small yet powerful improvements.',
            body: `LLMs have advanced at an incredible pace—new breakthroughs every year. The backbone is still the transformer, but the real magic comes from small yet powerful improvements. GPT is no different.

When we compare the architectures of GPT-2 and GPT-OSS 20B, it’s clear that OpenAI didn’t throw away the transformer backbone—instead, they kept refining it with smart, targeted improvements.

Here are a few that stood out:
- **No more dropout** → GPT-2 needed it, GPT-OSS doesn’t, since training now happens on massive datasets in just one pass.
- **RoPE embeddings** → Replace absolute embeddings, helping models handle longer context windows.
- **SwiGLU activations** → Make learning smoother. More efficient and scalable than GELU.
- **Mixture-of-Experts (MoE)** → Different “experts” inside the model specialize in different tasks, making models both bigger and faster.
- **Grouped Query Attention (GQA)** → Cuts down memory/computation while keeping performance strong.
- **RMSNorm** → A simpler, more stable normalization method than LayerNorm.

👉 The real story here isn’t about reinventing the transformer—it’s about evolving it step by step to make models faster, smarter, and more efficient.`,
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop', // Free image representing AI/Neural Networks
            category: 'Research',
            readTime: '4 min read'
        }
    });

    const post2 = await prisma.post.create({
        data: {
            type: 'blogs',
            title: 'OpenCrawl: The Future of AI Data Extraction',
            slug: 'opencrawl-ai-data-extraction',
            subtitle: 'Scraping the Web for LLMs',
            excerpt: 'Data is the new oil, and for Large Language Models, web scraping is the drill. OpenCrawl offers a robust, open-source approach to extracting clean, usable data for AI training.',
            body: `In the age of Large Language Models (LLMs), the quality of your model is directly proportional to the quality of your training data. 

**OpenCrawl** is emerging as a powerful, open-source solution designed specifically for AI data extraction. 

### Why do we need specialized scrapers?
Traditional web scrapers are built for e-commerce or SEO monitoring. They grab HTML and DOM elements. However, LLMs don't want raw HTML—they want structured, clean markdown or text, stripped of navbars, footers, and cookie banners.

### Key Features of OpenCrawl:
1. **Semantic HTML Parsing**: It understands the difference between an article body and a sidebar.
2. **Markdown Conversion**: Automatically converts complex web pages into LLM-friendly Markdown format.
3. **Rate Limiting & Politeness**: Built-in mechanisms to respect \`robots.txt\` and avoid overloading servers.
4. **Distributed Architecture**: Can scale horizontally to crawl millions of pages quickly.

As the demand for custom AI models grows, tools like OpenCrawl will become the backbone of the modern AI pipeline, ensuring that models are trained on high-quality, relevant data.`,
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop', // Free image representing data/scraping
            category: 'Engineering',
            readTime: '3 min read'
        }
    });

    console.log('Successfully seeded 2 blog posts.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
