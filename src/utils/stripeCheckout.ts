import { supabase, SUPABASE_URL_EXPORT } from '@/integrations/supabase/client';

export async function createCheckout(priceId: string, userId: string, userEmail: string) {
  const supabaseUrl = SUPABASE_URL_EXPORT;

  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      priceId,
      userId,
      userEmail,
      successUrl: window.location.origin + '/plans?success=true',
      cancelUrl: window.location.origin + '/plans?cancelled=true',
    }),
  });

  if (!response.ok) {
    throw new Error('Error creating checkout session');
  }

  const { url } = await response.json();
  window.location.href = url;
}
