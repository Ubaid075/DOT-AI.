import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { QuoteIcon, StarIcon } from './Icons';
import Avatar from './Avatar';
import { api } from '../services/api';

const Reviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/reviews');
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (isLoading || reviews.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto max-w-7xl py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Users Say</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Honest feedback from our creative community.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.slice(0, 6).map((review, index) => (
                    <ReviewCard key={review.id} review={review} index={index} />
                ))}
            </div>
        </div>
    );
};

const ReviewCard: React.FC<{ review: Review; index: number }> = ({ review, index }) => {
    const animationDelay = `${index * 100}ms`;
    const formatTimestamp = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    return (
        <div 
            className="p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col opacity-0 animate-fade-in-up" 
            style={{ animationDelay, animationFillMode: 'forwards' }}
        >
             <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <QuoteIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 flex-grow mb-6">"{review.comment}"</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <Avatar user={review.user} className="w-10 h-10" />
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{review.user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimestamp(review.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={i < review.rating} className="w-5 h-5" />
                    ))}
                </div>
            </div>
        </div>
    );
};


export default Reviews;