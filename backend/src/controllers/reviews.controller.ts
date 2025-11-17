import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getReviews = async (req: express.Request, res: express.Response) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    }
                }
            }
        });
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
};

export const createReview = async (req: express.Request, res: express.Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { rating, comment } = req.body;

        // Check if user already submitted a review
        const existingReview = await prisma.review.findFirst({ where: { userId }});
        if (existingReview) {
            return res.status(400).json({ message: "You have already submitted a review." });
        }

        const review = await prisma.review.create({
            data: {
                userId,
                rating,
                comment,
            }
        });
        res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review." });
    }
};