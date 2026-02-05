import { Router } from 'express';
import { UserController } from '@/controllers/UserController';

const router = Router();
const userController = new UserController();

// User profile routes
router.get('/me', userController.getMe);
router.get('/:id', userController.getUserById);
router.put('/profile', UserController.updateProfileValidation, userController.updateProfile);
router.put('/preferences', userController.updatePreferences);

// User search and discovery
router.get('/', userController.searchUsers);

// Account management
router.delete('/account', userController.deleteAccount);

export default router;
