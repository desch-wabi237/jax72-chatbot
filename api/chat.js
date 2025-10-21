import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log('🔧 API Gemini appelée - Méthode:', req.method);
  
  // Headers CORS complets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS préflight handled');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('❌ Méthode non autorisée:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  console.log('🔑 GEMINI_API_KEY présente:', !!GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY manquante');
    return res.status(500).json({
      error: 'Configuration manquante',
      message: 'GEMINI_API_KEY non configurée sur Vercel. Allez dans Settings > Environment Variables.'
    });
  }

  try {
    let userQuery;
    
    // Parser le body
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        userQuery = parsed.userQuery;
      } catch (e) {
        userQuery = req.body;
      }
    } else {
      userQuery = req.body?.userQuery;
    }

    console.log('💬 Question utilisateur:', userQuery);

    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({ error: 'Question utilisateur manquante' });
    }

    // Configuration Gemini
    const MODEL = "gemini-pro";
    const PROMO_CODE = "JAX72";
    const AFFILIATE_LINK_1XBET = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const AFFILIATE_LINK_MELBET = "https://lien-melbet-a-remplacer.com";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    const SYSTEM_PROMPT = `Tu es JAX72PRONOSTIC, expert en paris sportifs et bonus.

MISSION PRINCIPALE :
- Promouvoir le code promo ${PROMO_CODE} pour 1xBet et Melbet
- Aider les utilisateurs à obtenir le BONUS MAXIMAL
- Donner des conseils sur les paris sportifs

RÈGLES STRICTES :
- Réponds en FRANÇAIS
- Sois concis (2-3 phrases maximum)
- Mentionne TOUJOURS le code ${PROMO_CODE}
- Sois persuasif et engageant
- Propose les liens d'inscription

LIENS À UTILISER :
- 1xBet: ${AFFILIATE_LINK_1XBET}
- Melbet: ${AFFILIATE_LINK_MELBET}
- WhatsApp: ${WHATSAPP_LINK}
- Telegram: ${TELEGRAM_LINK}

Question de l'utilisateur : ${userQuery}

Réponds maintenant en suivant ces instructions :`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: SYSTEM_PROMPT
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    console.log('🔄 Appel à Gemini...');
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log('📊 Statut Gemini:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Gemini:', errorText);
      
      // Réponse de secours si Gemini échoue
      const fallbackResponse = `🎯 Bonjour ! Utilisez le code **${PROMO_CODE}** pour obtenir le bonus maximal sur 1xBet et Melbet. 🚀

🎰 1xBet: ${AFFILIATE_LINK_1XBET}
⚽ Melbet: ${AFFILIATE_LINK_MELBET}

💬 WhatsApp: ${WHATSAPP_LINK}
📢 Telegram: ${TELEGRAM_LINK}`;
      
      return res.status(200).send(fallbackResponse);
    }

    const data = await response.json();
    console.log('✅ Réponse Gemini reçue');

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text 
      || `🎯 Utilisez le code **${PROMO_CODE}** pour votre bonus ! 🎰 ${AFFILIATE_LINK_1XBET} ⚽ ${AFFILIATE_LINK_MELBET}`;

    console.log('📝 Réponse finale:', text.substring(0, 100) + '...');
    
    return res.status(200).send(text);

  } catch (error) {
    console.error('💥 Erreur serveur:', error);
    
    // Réponse d'erreur gracieuse
    const errorResponse = `🚨 Service temporairement indisponible. 

🎯 **Code promo : ${PROMO_CODE}**

🎰 1xBet: https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573
⚽ Melbet: https://lien-melbet-a-remplacer.com

Revenez dans quelques minutes !`;
    
    return res.status(200).send(errorResponse);
  }
}