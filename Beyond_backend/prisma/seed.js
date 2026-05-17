// ============================================================================
// seed.js — Database Seed Script
// ============================================================================
//
// 🎓 LEARNING: What is "seeding"?
// Seeding populates your database with initial data so you can start using
// the application immediately after setup. Without seeding, every new
// installation would start with an empty database — no admin user, no posts.
//
// Run this script with:
//   npm run seed
//   (which executes: node prisma/seed.js)
//
// This script:
//   1. Creates an admin user (you!) so you can access the CMS
//   2. Creates a sample blog post so the homepage isn't empty
//
// You can run this script multiple times safely — it deletes existing data first.
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // --- 1. Create the Admin User ---
    // 🎓 LEARNING: We hash the password here just like the auth service does.
    // The admin user is the ONLY user created via seed — regular users register
    // through the signup API endpoint.
    const adminEmail = 'viveshkrsingh19@gmail.com';

    // Delete existing admin if present (safe to re-run)
    await prisma.user.deleteMany({ where: { email: adminEmail } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await prisma.user.create({
        data: {
            username: 'Vivesh Kumar Singh',
            email: adminEmail,
            password_hash: hashedPassword,
            role: 'admin'
        }
    });
    console.log(`✅ Admin user created: ${admin.email} (password: admin123)`);
    console.log(`   ⚠️  CHANGE THIS PASSWORD after first login!\n`);

    // --- 2. Create a Sample Blog Post ---
    // Delete existing sample post if present
    await prisma.post.deleteMany({ where: { slug: 'interpreting-latent-representations' } });

    const samplePost = await prisma.post.create({
        data: {
            type: 'blogs',
            title: 'Interpreting Latent Representations in Modern LLMs',
            slug: 'interpreting-latent-representations',
            subtitle: 'Exploring why traditional vector space thinking might be limiting our understanding of AI reasoning.',
            excerpt: 'A deep dive into why "closeness" in vector space might not be the most accurate abstraction for how transformers process logic.',
            body: '# Interpreting Latent Representations\n\nThis is a sample post created by the seed script. Replace this content with your actual blog post.\n\n## Key Ideas\n\n- Vector space is a useful abstraction but has limitations\n- Transformers process information differently than we might expect\n- Understanding these differences is crucial for building better AI systems',
            image: '/assets/logo.png',
            category: 'Research',
            readTime: '12 min read',
        }
    });
    console.log(`✅ Sample blog post created: "${samplePost.title}"\n`);

    console.log('🌱 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
