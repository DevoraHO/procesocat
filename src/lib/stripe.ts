import { loadStripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!key) {
  console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not set — Stripe payments will use mock mode.');
}

export const stripePromise = key ? loadStripe(key) : null;

export const PRICE_IDS = {
  FAMILIAR_MONTHLY: 'price_familiar_monthly',
  FAMILIAR_YEARLY: 'price_familiar_yearly',
  MUNICIPI: 'price_municipi',
} as const;
