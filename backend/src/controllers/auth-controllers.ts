import express from 'express'
import prisma from '../db.ts'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod';
import dotenv from 'dotenv';
const router = express.Router();

dotenv.config();
const SignupSchema = z.object({
    userName: z.string().min(3),
    password: z.string().min(8)
})

// Sign in Schema
const SigninSchema = z.object({
    userName: z.string(),
    password: z.string()
})

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}

router.post('/signup', async (req, res) => {
    const result = SignupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error })
    }
    const { userName, password } = result.data
    const existingUser = await prisma.user.findUnique({
        where: {
            userName
        },
    })

    if (existingUser) {
        return res.status(409).json({ message: "user is already existing" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            userName: userName,
            password: hashedPassword,
        },
    })

    res.status(200).json({ message: 'User signed up successfully', user: user.userId });
})

// Route to Sign-in

router.post('/signin', async (req, res) => {
    const result = SigninSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: "All fields are requires", errors: result.error })
    }

    const { userName, password } = result.data
    const user = await prisma.user.findUnique({
        where: { userName },
    });

    if (!user) {
        return res.status(404).json({ message: "user is not found" })

    }

    const compare_passwords = await bcrypt.compare(password, user.password);

    if (!compare_passwords) {
        res.status(401).json({ message: "Invalid login credentials" });
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
        message: "user is logged in successfully",
        token,
        user: {
            userId: user.userId,
            userName
        }
    });
})

export default router;
