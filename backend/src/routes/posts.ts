import { Router } from 'express';

const router = Router();

// Returns the total like count for a post
// GET /api/posts/:slug/likes 
router.get('/:slug/likes', (req, res) => {
  const { slug } = req.params;
  res.json({ slug });
});

// Toggles a like on a post — likes if not liked, unlikes if already liked
// POST /api/posts/:slug/like  
router.post('/:slug/like', (req, res) => {
  const { slug } = req.params;
  res.json({ slug });
});

export default router;
