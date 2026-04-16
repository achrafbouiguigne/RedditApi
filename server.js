const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('realtime')); // New folder for real-time assets

// Your existing Reddit API endpoint
app.get('/api/reddit', async (req, res) => {
    try {
        const { subreddit = 'technology', sort = 'hot', limit = 25 } = req.query;
        
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/${sort}.json`, {
            params: { limit },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const posts = response.data.data.children.map(child => {
            const data = child.data;
            const hashtags = extractHashtags(data.title + ' ' + (data.selftext || ''));
            const mentions = extractMentions(data.title + ' ' + (data.selftext || ''));
            
            return {
                id: data.id,
                title: data.title,
                subreddit: data.subreddit,
                author: data.author,
                score: data.score,
                upvote_ratio: data.upvote_ratio,
                num_comments: data.num_comments,
                created_utc: data.created_utc,
                created_ago: timeAgo(data.created_utc),
                hashtags: hashtags,
                mentions: mentions,
                engagement_score: calculateEngagement(data.score, data.num_comments, data.upvote_ratio)
            };
        });

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            count: posts.length,
            posts: posts
        });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// NEW: Real-time streaming endpoint (simulates live data)
app.get('/api/realtime/stream', async (req, res) => {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send updates every 5 seconds
    const intervalId = setInterval(async () => {
        try {
            const response = await axios.get(`https://www.reddit.com/r/technology/new.json?limit=5`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            const newPosts = response.data.data.children.map(child => ({
                id: child.data.id,
                title: child.data.title,
                score: child.data.score,
                num_comments: child.data.num_comments,
                created_ago: timeAgo(child.data.created_utc)
            }));
            
            res.write(`data: ${JSON.stringify({ posts: newPosts, timestamp: new Date().toISOString() })}\n\n`);
        } catch (error) {
            console.error('Stream error:', error);
        }
    }, 5000);
    
    // Clean up on client disconnect
    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

// Helper functions (same as before)
function extractHashtags(text) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const matches = text.match(hashtagRegex) || [];
    return [...new Set(matches)];
}

function extractMentions(text) {
    const mentionRegex = /@[\w\u0590-\u05ff]+/g;
    const matches = text.match(mentionRegex) || [];
    return [...new Set(matches)];
}

function calculateEngagement(score, comments, ratio) {
    return Math.round((score * 0.4) + (comments * 0.4) + (ratio * 20));
}

function timeAgo(timestamp) {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    const intervals = {
        year: 31536000, month: 2592000, week: 604800,
        day: 86400, hour: 3600, minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    return 'just now';
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Real-Time Dashboard: http://localhost:${PORT}/realtime.html`);
    console.log(` Prediction Interface: http://localhost:${PORT}/index.html (coming soon)`);
});