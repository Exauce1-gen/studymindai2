// pages/api/fedapay-webhook.ts
// Endpoint pour recevoir les notifications FedaPay et activer automatiquement Premium

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'fedapay';

// Initialiser Supabase (côté serveur avec service_role key)
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Clé service_role (à ajouter dans Vercel)

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Nécessaire pour vérifier la signature : on a besoin du corps BRUT de la
// requête (pas déjà parsé en JSON par Next.js), donc on désactive le
// bodyParser automatique sur cette route.
export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Vérification de la signature FedaPay (SÉCURITÉ CRITIQUE) ---
  // Sans ça, n'importe qui connaissant cette URL pourrait s'activer Premium
  // gratuitement en envoyant une fausse requête.
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ FEDAPAY_WEBHOOK_SECRET non configuré côté serveur');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers['x-fedapay-signature'];

  let verifiedEvent: any;
  try {
    verifiedEvent = Webhook.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Signature webhook invalide:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    console.log('🔔 Webhook FedaPay reçu (signature vérifiée):', JSON.stringify(verifiedEvent, null, 2));

    const { entity, event } = verifiedEvent;

    // Vérifier que c'est une transaction approuvée
    if (event !== 'transaction.approved') {
      console.log('⚠️ Event ignoré:', event);
      return res.status(200).json({ message: 'Event ignored', event });
    }

    if (!entity || !entity.id) {
      console.log('❌ Données invalides');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const transaction = entity;
    const transactionId = transaction.id;
    const amount = transaction.amount;
    const customerEmail = transaction.customer?.email;
    const status = transaction.status;

    console.log('📦 Transaction:', {
      id: transactionId,
      amount,
      email: customerEmail,
      status
    });

    // Vérifier que le paiement est bien approuvé
    if (status !== 'approved') {
      console.log('⚠️ Statut non approuvé:', status);
      return res.status(200).json({ message: 'Payment not approved', status });
    }

    // Déterminer le type de plan selon le montant
    let planType: 'weekly' | 'monthly';
    let premiumUntil: Date;
    const now = new Date();

    if (amount === 500) {
      planType = 'weekly';
      premiumUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours
    } else if (amount === 2000) {
      planType = 'monthly';
      premiumUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours
    } else {
      console.log('⚠️ Montant inconnu:', amount);
      return res.status(400).json({ error: 'Unknown amount', amount });
    }

    console.log('💎 Plan détecté:', planType, '- Valide jusqu\'au:', premiumUntil);

    // 0. Vérifier qu'on n'a pas déjà traité cette transaction (FedaPay peut renvoyer le même webhook plusieurs fois)
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('transaction_id', transactionId)
      .limit(1);

    if (existingTx && existingTx.length > 0) {
      console.log('ℹ️ Transaction déjà traitée, on ignore:', transactionId);
      return res.status(200).json({ message: 'Already processed', transactionId });
    }

    // 1. Trouver l'utilisateur par email
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', customerEmail)
      .limit(1);

    if (findError) {
      console.error('❌ Erreur recherche utilisateur:', findError);
      return res.status(500).json({ error: 'Database error', details: findError });
    }

    if (!users || users.length === 0) {
      console.log('⚠️ Utilisateur non trouvé:', customerEmail);
      return res.status(404).json({ error: 'User not found', email: customerEmail });
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:', user.email, '- ID:', user.id);

    // 2. Sauvegarder la transaction dans la base
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_id: transactionId,
        plan_type: planType,
        amount: amount,
        status: 'approved',
        fedapay_status: status,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ Erreur sauvegarde transaction:', transactionError);
      // Continue quand même pour activer Premium
    } else {
      console.log('✅ Transaction sauvegardée');
    }

    // 3. Activer Premium pour l'utilisateur
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_premium: true,
        premium_until: premiumUntil.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Erreur activation Premium:', updateError);
      return res.status(500).json({ error: 'Failed to activate premium', details: updateError });
    }

    console.log('🎉 Premium activé avec succès pour:', user.email);

    // 4. Réponse de succès
    return res.status(200).json({
      success: true,
      message: 'Premium activated successfully',
      user: {
        id: user.id,
        email: user.email,
        plan: planType,
        premium_until: premiumUntil.toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
