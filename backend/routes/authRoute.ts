import express from 'express';
import { z } from "zod";
import { ROLES } from '../utils/permission';
import { registerUser , loginUser } from '../controllers/authController';
import { validate } from '../middleware/validate';
const router = express.Router();

/*--------------------------VALIDATION SCHEMA---------------------------------*/


const signupSchema = z.object({
  name: z.string().min(3, "Name must be 3 character long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be atleast 8 character long"),
  role: z.enum([ROLES.ADMIN, ROLES.USER]),
  isVerified: z.boolean().optional(),
  isBlocked: z.boolean().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8 character long")
});

//------login and register--------------------
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Payal
 *               email:
 *                 type: string
 *                 example: payal@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */

router.post("/register",validate(signupSchema),registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user using email and password and return a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: payal@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f123456789abcdef123456
 *                     name:
 *                       type: string
 *                       example: Payal
 *                     email:
 *                       type: string
 *                       example: payal@gmail.com
 *       400:
 *         description: Invalid email or password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/login",validate(loginSchema),loginUser);


export default router;

