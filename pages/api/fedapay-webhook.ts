// pages/api/fedapay-webhook.ts
// Endpoint pour recevoir les notifications FedaPay et activer automatiquement Premium

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase (côté serveur avec service_role key)
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Clé service_role (à ajouter dans Vercel)

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔔 Webhook FedaPay reçu:', JSON.stringify(req.body, null, 2));

    const { entity, event } = req.body;

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
