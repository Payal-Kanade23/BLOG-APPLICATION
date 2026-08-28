import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadProfile } from '../middleware/upload';
import { getAllUser , getProfile, updateUser , acceptFollowRequest,followUser, rejectFollowRequest, deleteUser, getFollowRequests} from '../controllers/userController';
import { authorize } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permission';
const router = express.Router();

router.get("/users",authMiddleware ,authorize(PERMISSIONS.VIEW_USERS), getAllUser);

router.get("/profile", authMiddleware,authorize(PERMISSIONS.VIEW_PROFILE), getProfile);

router.get("/profile/:id", authMiddleware,authorize(PERMISSIONS.VIEW_PROFILE), getProfile);

router.delete("/user/:id", authMiddleware,authorize(PERMISSIONS.DELETE_USER), deleteUser);


router.put(
  "/user",
  authMiddleware,
  authorize(PERMISSIONS.EDIT_USER),
  uploadProfile.single("profileImage"),
  updateUser
);

router.post(
  "/users/:id/follow",
  authMiddleware,
  authorize(PERMISSIONS.FOLLOW_USERS),
  followUser
);

router.patch(
  "/users/follow-request/:senderId/accept",
  authMiddleware,
   authorize(PERMISSIONS.FOLLOW_REQUEST),
  acceptFollowRequest
);

router.patch(
  "/users/follow-request/:senderId/reject",
  authMiddleware,
     authorize(PERMISSIONS.FOLLOW_REQUEST),

  rejectFollowRequest
);

router.get(
  "/users/follow-requests",
  authMiddleware,
  authorize(PERMISSIONS.FOLLOW_REQUEST),
  getFollowRequests
);
export default router;

