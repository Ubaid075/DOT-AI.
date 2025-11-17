import { CreditPackage } from './types';

export const INITIAL_CREDITS = 25;
export const GENERATION_COST = 5;

export const CREDIT_PACKAGES: CreditPackage[] = [
  { credits: 75, price: 5, description: 'Best for starters' },
  { credits: 150, price: 9, description: 'Most popular' },
  { credits: 300, price: 17, description: 'Best value' },
];
