import express from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageQuality, ImageStyle } from '../../../frontend/src/types'; // Assuming types are shared
import { GENERATION_COST } from '../../../frontend/src/constants';

const prisma = new PrismaClient();

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const generateImage = async (req: express.Request, res: express.Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { prompt, aspectRatio, style, quality } = req.body as {
    prompt: string;
    aspectRatio: AspectRatio;
    style: ImageStyle;
    quality: ImageQuality;
  };
  
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Admin check
    if (user.role !== 'admin' && user.credits < GENERATION_COST) {
      return res.status(403).json({ message: "Insufficient credits." });
    }

    // Call the AI Image Generation API
    const enhancedPrompt = `${prompt}, ${style}, ${quality}`;
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (!base64ImageBytes) {
      throw new Error("Image generation failed, no image returned from API.");
    }
    
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

    // Deduct credits only if not an admin and generation was successful
    let updatedUser;
    if (user.role !== 'admin') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
            credits: { decrement: GENERATION_COST },
            generationHistory: {
                create: {
                    prompt,
                    style,
                    quality,
                    date: new Date().toISOString()
                }
            }
        },
        include: { favorites: true },
      });
    } else {
        // Still record generation history for admin
        await prisma.user.update({
            where: { id: userId },
            data: {
                generationHistory: {
                    create: { prompt, style, quality, date: new Date().toISOString() }
                }
            }
        });
        updatedUser = await prisma.user.findUnique({ where: { id: userId }, include: { favorites: true }});
    }

    const { password, ...userWithoutPassword } = updatedUser!;

    res.status(200).json({ imageUrl, user: userWithoutPassword });

  } catch (error) {
    console.error("Error in generateImage controller:", error);
    res.status(500).json({ message: "Failed to generate image." });
  }
};

export const getPublicGalleryImages = async (req: express.Request, res: express.Response) => {
    try {
        // In a real scenario, this would be:
        // @ts-ignore
        const images = await prisma.publicGalleryImage.findMany({ orderBy: { createdAt: 'desc' }});
        if (images.length === 0) {
            // Provide some default images if gallery is empty
             const mockImages = [
                { id: '1', imageUrl: 'https://storage.googleapis.com/pinto-pachyderm-899147.appspot.com/a9c2db7b-05ba-4654-a63e-63f68d27776d.png', title: 'Cyberpunk City', style: ImageStyle.AESTHETIC, createdAt: new Date().toISOString(), addedBy: 1 },
                { id: '2', imageUrl: 'https://storage.googleapis.com/pinto-pachyderm-899147.appspot.com/66904673-a8e5-423a-85cf-25d2a9d8050e.png', title: 'Enchanted Forest', style: ImageStyle.REALISTIC, createdAt: new Date().toISOString(), addedBy: 1 },
                { id: '3', imageUrl: 'https://storage.googleapis.com/pinto-pachyderm-899147.appspot.com/001a1e35-3759-4256-a09c-366551b99763.png', title: 'Space Explorer', style: ImageStyle.THREE_D, createdAt: new Date().toISOString(), addedBy: 1 },
                { id: '4', imageUrl: 'https://storage.googleapis.com/pinto-pachyderm-899147.appspot.com/a42b9347-f7a3-4a11-a53c-2358e178b549.png', title: 'Anime Hero', style: ImageStyle.ANIMATED, createdAt: new Date().toISOString(), addedBy: 1 },
            ];
            return res.status(200).json(mockImages);
        }
        res.status(200).json(images);
    } catch (error) {
        console.error("Error fetching public gallery:", error);
        res.status(500).json({ message: "Failed to fetch gallery images." });
    }
};

export const adminAddGalleryImage = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const adminId = req.user.id;
    const { imageUrl, title, style } = req.body;

    if (!imageUrl || !title || !style) {
        return res.status(400).json({ message: "imageUrl, title, and style are required." });
    }

    try {
        // @ts-ignore
        const newImage = await prisma.publicGalleryImage.create({
            data: {
                imageUrl,
                title,
                style,
                addedBy: adminId,
            }
        });
        res.status(201).json(newImage);
    } catch(e) {
        console.error("Error adding gallery image:", e);
        res.status(500).json({ message: "Could not add image to gallery." });
    }
}