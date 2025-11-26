// server/src/routes/userRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateMe } from '../controllers/userController.js';

const router = express.Router();

router.put('/me', requireAuth, updateMe);

export default router;
