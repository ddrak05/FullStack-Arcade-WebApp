import express from "express";
import {authenticateToken} from "../middleware/auth.js";

import router from "./user.js";
import {
    getAvatars,
    updateAvatar,
    toggleVisibility,
    updateUsername,
    updatePassword,
    deleteAccount
} from "../controllers/settingsController.js";

router.get('/fetch-avatars', authenticateToken, getAvatars);
router.post('/update-avatar', authenticateToken, updateAvatar);
router.post('/toggle-visibility', authenticateToken, toggleVisibility)
router.post('/update-username', authenticateToken, updateUsername)
router.post('/update-password', authenticateToken, updatePassword)
router.get('/delete-account', authenticateToken, deleteAccount)

export default router;