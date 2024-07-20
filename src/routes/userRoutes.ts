import express from 'express';
import { approveSignup, loginUser, showUserData, borrowMoney } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', approveSignup);
router.post('/login', loginUser);
router.get('/', authenticateJWT, showUserData);
router.post('/borrow', authenticateJWT, borrowMoney);

export default router;
