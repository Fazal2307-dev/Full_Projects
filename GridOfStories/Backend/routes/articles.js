const express = require('express');
const { body, validationResult } = require('express-validator');
const Article = require('../models/Article');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all articles (public)
router.get('/', async (req, res) => {
  try {
    const { tag, author, published = 'true' } = req.query;
    const filter = { published: published === 'true' };

    if (tag) filter.tags = tag;
    if (author) filter.author = author;

    const articles = await Article.find(filter)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create article (protected)
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subtitle, content, tags, published } = req.body;

    const article = new Article({
      title,
      subtitle,
      content,
      tags: tags || [],
      author: req.user._id,
      published: published || false
    });

    await article.save();
    await article.populate('author', 'name email avatar');

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update article (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, subtitle, content, tags, published } = req.body;

    if (title) article.title = title;
    if (subtitle !== undefined) article.subtitle = subtitle;
    if (content) article.content = content;
    if (tags) article.tags = tags;
    if (published !== undefined) article.published = published;

    await article.save();
    await article.populate('author', 'name email avatar');

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete article (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await article.deleteOne();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like article (protected)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const likeIndex = article.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      article.likes.splice(likeIndex, 1);
    } else {
      // Like
      article.likes.push(req.user._id);
    }

    await article.save();

    res.json({ likes: article.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment (protected)
router.post('/:id/comment', auth, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    article.comments.push(comment);
    await article.save();
    await article.populate('comments.user', 'name avatar');

    res.status(201).json(article.comments[article.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;