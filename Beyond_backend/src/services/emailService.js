// ============================================================================
// emailService.js — Email Notification Service
// ============================================================================
//
// 🎓 LEARNING: This service sends beautiful branded emails to all registered
// users when a new blog post is published. It uses Nodemailer with Gmail SMTP.
//
// How it works:
//   1. Admin publishes a new post via the CMS
//   2. postService.createPost() calls sendNewPostNotification()
//   3. This service fetches ALL registered user emails from the database
//   4. It generates a beautifully styled HTML email
//   5. It sends the email using BCC (so users don't see each other's emails)
//
// 🎓 LEARNING: We use Gmail's "App Passwords" (not the regular password).
// You generate these in your Google Account → Security → 2-Step Verification
// → App Passwords. The 16-character code is what goes in EMAIL_PASS.
// ============================================================================

const nodemailer = require('nodemailer');
const prisma = require('../config/db');

// ============================================================================
// Configure the email transporter (Gmail SMTP)
// ============================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ============================================================================
// generateEmailHTML — Creates a beautiful branded HTML email
// ============================================================================
// @param {object} post — The newly created post object
// @param {string} postUrl — The full URL to the post
// @returns {string} Complete HTML email string
// ============================================================================
function generateEmailHTML(post, postUrl) {
    const title = post.title || 'New Post';
    const excerpt = post.excerpt || 'A new piece of research has been published on BeyondEmbeddings.';
    const readTime = post.readTime || '5 min read';
    const category = post.category || 'Research';
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — BeyondEmbeddings</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ee; font-family: 'Georgia', 'Times New Roman', serif;">
    
    <!-- Outer Container -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ee; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Email Card -->
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                    
                    <!-- Header / Brand -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2520 100%); padding: 36px 40px; text-align: center;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px; color: #c9a96e; font-family: 'Georgia', serif;">
                                            BEYOND<span style="font-weight: 700;">EMBEDDINGS</span>
                                        </h1>
                                        <p style="margin: 8px 0 0 0; font-size: 12px; letter-spacing: 3px; color: #8a7d6b; text-transform: uppercase; font-family: Arial, sans-serif;">
                                            New Research Published
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Accent Line -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #8b6e4b, #c9a96e, #8b6e4b);"></td>
                    </tr>

                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 48px 40px 32px 40px;">
                            
                            <!-- Category & Date -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <span style="display: inline-block; background-color: #f4f1ea; color: #8b6e4b; padding: 4px 14px; border-radius: 20px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">
                                            ${category}
                                        </span>
                                        <span style="color: #999; font-size: 13px; margin-left: 12px; font-family: Arial, sans-serif;">
                                            ${date} &nbsp;·&nbsp; ${readTime}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <h2 style="margin: 24px 0 16px 0; font-size: 28px; font-weight: 400; line-height: 1.3; color: #111111; font-family: 'Georgia', serif;">
                                ${title}
                            </h2>

                            <!-- Excerpt -->
                            <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.8; color: #555555; font-family: Arial, Helvetica, sans-serif;">
                                ${excerpt}
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #8b6e4b 0%, #a07d55 100%);">
                                        <a href="${postUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; letter-spacing: 0.5px;">
                                            Read Full Article →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-top: 1px solid #eaeaea;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px 36px 40px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #999999; font-family: Arial, sans-serif;">
                                You're receiving this because you signed up at 
                                <a href="${process.env.FRONTEND_URL || 'https://beyondembeddings.com'}" style="color: #8b6e4b; text-decoration: underline;">BeyondEmbeddings</a>.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #cccccc; font-family: Arial, sans-serif;">
                                © ${new Date().getFullYear()} BeyondEmbeddings · Vivesh Kumar Singh
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;
}

// ============================================================================
// sendNewPostNotification — Sends email to all registered users
// ============================================================================
// @param {object} post — The newly created post from the database
//
// 🎓 LEARNING: We use BCC (Blind Carbon Copy) so that:
//   1. Users don't see each other's email addresses (privacy)
//   2. We only send ONE email to Gmail's SMTP instead of N separate ones
//   3. It's much faster and less likely to hit rate limits
//
// 🎓 LEARNING: We fire-and-forget (don't await in the controller).
// If the email fails, we log the error but don't fail the post creation.
// The admin should not be blocked from publishing because email is down.
// ============================================================================
async function sendNewPostNotification(post) {
    try {
        // 1. Get all registered user emails
        const users = await prisma.user.findMany({
            select: { email: true }
        });

        if (users.length === 0) {
            console.log('📧 No subscribers to notify.');
            return;
        }

        const emails = users.map(u => u.email);

        // 2. Build the post URL
        const frontendUrl = (process.env.FRONTEND_URL || 'https://beyondembeddings.com').replace(/\/$/, '');
        const slug = post.slug || post.id;
        const postUrl = `${frontendUrl}/post/${slug}`;

        // 3. Generate the beautiful HTML email
        const html = generateEmailHTML(post, postUrl);

        // 4. Send the email via BCC
        const mailOptions = {
            from: `"BeyondEmbeddings" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,      // Send to self
            bcc: emails,                       // All subscribers in BCC
            subject: `📝 New Post: ${post.title || 'New Research Published'}`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Notification sent to ${emails.length} subscribers. MessageID: ${info.messageId}`);

    } catch (error) {
        // Don't throw — email failure should NOT prevent post creation
        console.error('📧 Failed to send email notification:', error.message);
    }
}

module.exports = {
    sendNewPostNotification,
    generateEmailHTML
};
