import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// == USER-SPECIFIC CONTROLLERS ==

export const getMe = async (req: express.Request, res: express.Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          orderBy: {
            createdAt: 'desc',
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMe = async (req: express.Request, res: express.Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { name, avatar, password: newPassword } = req.body;
        
        const updateData: { name?: string; avatar?: string; password?: string } = {};

        if (name) updateData.name = name;
        if (typeof avatar !== 'undefined') updateData.avatar = avatar; // Allow setting avatar to "" or null
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { favorites: true }
        });

        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ message: "Profile updated", user: userWithoutPassword });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile." });
    }
}

export const deleteMe = async (req: express.Request, res: express.Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        await prisma.user.delete({ where: { id: userId } });
        res.status(200).json({ message: "Account deleted successfully." });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "Failed to delete account." });
    }
}


export const toggleFavorite = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const userId = req.user.id;
    const { imageUrl, prompt } = req.body;

    if (!imageUrl || !prompt) {
        return res.status(400).json({ message: 'Image URL and prompt are required.' });
    }

    try {
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_imageUrl: {
                    userId,
                    imageUrl,
                },
            },
        });

        let message: string;

        if (existingFavorite) {
            // Remove from favorites
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });
            message = 'Removed from favorites.';
        } else {
            // Add to favorites
            await prisma.favorite.create({
                data: {
                    userId,
                    imageUrl,
                    prompt,
                },
            });
            message = 'Added to favorites!';
        }

        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { favorites: { orderBy: { createdAt: 'desc' } } },
        });
        
        const { password, ...userWithoutPassword } = updatedUser!;

        res.status(200).json({ message, user: userWithoutPassword });

    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ message: 'Failed to update favorites.' });
    }
};

export const createCreditRequest = async (req: express.Request, res: express.Response) => {
    try {
        // @ts-ignore
        const { id: userId, name, email } = req.user;
        const { transactionId, amountPaid, creditPackage, paymentDate } = req.body;
        
        // @ts-ignore
        const request = await prisma.creditRequest.create({
            data: {
                userId,
                name,
                email,
                transactionId,
                amountPaid,
                creditPackage, 
                paymentDate: new Date(paymentDate),
                status: 'Pending',
            }
        });
        res.status(201).json({ message: "Request submitted.", request });

    } catch (error) {
        console.error("Error creating credit request:", error);
        res.status(500).json({ message: "Failed to submit request." });
    }
};

export const getMyHistory = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const userId = req.user.id;
    // @ts-ignore
    const history = await prisma.generationHistory.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    res.status(200).json(history);
}

export const getMyTransactions = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const userId = req.user.id;
     // @ts-ignore
    const transactions = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    res.status(200).json(transactions);
}

export const getMyCreditRequests = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const userId = req.user.id;
     // @ts-ignore
    const requests = await prisma.creditRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.status(200).json(requests);
}


// == ADMIN CONTROLLERS ==

export const adminGetAllUsers = async (req: express.Request, res: express.Response) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }});
    res.status(200).json(users.map(({ password, ...user }) => user));
};

export const adminAddCredits = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { amount } = req.body;
    const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { credits: { increment: amount } }
    });
     const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
};

export const adminDeleteUser = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'User deleted.' });
};

export const adminGetAllHistory = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const history = await prisma.generationHistory.findMany({ orderBy: { date: 'desc' } });
    res.status(200).json(history);
};

export const adminGetAllTransactions = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const transactions = await prisma.transaction.findMany({ orderBy: { date: 'desc' } });
    res.status(200).json(transactions);
};

export const adminGetAllCreditRequests = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const requests = await prisma.creditRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(requests);
};

export const adminApproveCreditRequest = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
        // @ts-ignore
        const request = await prisma.creditRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request || request.status !== 'Pending') {
            return res.status(404).json({ message: "Request not found or already resolved." });
        }

        // Use a transaction to ensure atomicity
        const [updatedRequest, _] = await prisma.$transaction([
            prisma.creditRequest.update({
                where: { id: request.id },
                data: { status: 'Approved', resolvedAt: new Date() }
            }),
            prisma.user.update({
                where: { id: request.userId },
                data: { credits: { increment: request.creditPackage.credits } }
            }),
            // @ts-ignore
            prisma.transaction.create({
                data: {
                    userId: request.userId,
                    name: request.name,
                    creditsPurchased: request.creditPackage.credits,
                    amountPaid: request.amountPaid,
                    date: new Date().toISOString(),
                    status: 'Completed'
                }
            })
        ]);

        res.status(200).json({ message: "Request approved.", request: updatedRequest });
    } catch(e) {
        console.error(e);
        res.status(500).json({ message: "Failed to approve request." });
    }
};

export const adminRejectCreditRequest = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { note } = req.body;
     try {
        // @ts-ignore
        const request = await prisma.creditRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request || request.status !== 'Pending') {
            return res.status(404).json({ message: "Request not found or already resolved." });
        }
        const updatedRequest = await prisma.creditRequest.update({
            where: { id: request.id },
            data: { status: 'Rejected', adminNote: note, resolvedAt: new Date() }
        });
        res.status(200).json({ message: "Request rejected.", request: updatedRequest });
    } catch(e) {
        console.error(e);
        res.status(500).json({ message: "Failed to reject request." });
    }
};