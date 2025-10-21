const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "Configuration serveur manquante",
      message: "GEMINI_API_KEY non configurée sur Vercel"
    });
  }

  try {
    let userQuery;
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      userQuery = body.userQuery;
    } catch (e) {
      return res.status(400).json({ error: 'Format de requête invalide' });
    }
    
    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({ error: 'Requête utilisateur manquante' });
    }

    // Configuration JAX72
    const MODEL = 'gemini-pro';
    const PROMO_CODE = "JAX72";
    const AFFILIATE_LINK_1XBET = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const AFFILIATE_LINK_MELBET = "https://lien-melbet-a-remplacer.com";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    const SYSTEM_PROMPT = `Vous êtes JAX72PRONOSTIC, assistant expert pour les bonus de paris sportifs sur 1xBet et Melbet. 

Votre mission : Convaincre d'utiliser le code promo **${PROMO_CODE}** pour le bonus maximal.

Règles importantes :
- Répondez de manière engageante, informative et courte (2-3 phrases max)
- Toujours inclure le code **${PROMO_CODE}** dans votre réponse
- Soyez persuasif mais professionnel
- Mentionnez les avantages du bonus

Liens à utiliser :
- 1xBet: ${AFFILIATE_LINK_1XBET}
- Melbet: ${AFFILIATE_LINK_MELBET}
- WhatsApp: ${WHATSAPP_LINK}
- Telegram: ${TELEGRAM_LINK}

Utilisez **gras** pour le code promo.`;

    const payload = {
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nQuestion de l'utilisateur: ${userQuery}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Réponse vide de Gemini');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(text);

  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(200).send(`Désolé, service temporairement indisponible. Utilisez le code **JAX72** pour votre bonus.`);
  }
};