import express from 'express';
import { AuthController } from '../controller/authController';
const router = express.Router();

//authController instance
const auth = new AuthController();

router.post('/resigter', auth.register);

export default router;
