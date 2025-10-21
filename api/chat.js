import fetch from "node-fetch";

export default async function handler(req, res) {
  // Headers CORS améliorés
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY manquante");
    return res.status(500).json({
      error: "Configuration serveur manquante",
      message: "GEMINI_API_KEY non configurée sur Vercel",
    });
  }

  try {
    let userQuery;
    
    // Gestion robuste du body
    if (typeof req.body === 'string') {
      try {
        userQuery = JSON.parse(req.body).userQuery;
      } catch (e) {
        userQuery = req.body;
      }
    } else {
      userQuery = req.body?.userQuery;
    }

    if (!userQuery || typeof userQuery !== "string") {
      return res.status(400).json({ 
        error: "Requête utilisateur manquante",
        received: userQuery 
      });
    }

    console.log("📨 Requête reçue:", userQuery.substring(0, 100));

    // Configuration JAX72
    const MODEL = "gemini-1.5-flash-latest"; // Modèle plus récent
    const PROMO_CODE = "JAX72";
    const AFFILIATE_LINK_1XBET = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const AFFILIATE_LINK_MELBET = "https://lien-melbet-a-remplacer.com";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    const SYSTEM_PROMPT = `Tu es JAX72PRONOSTIC, assistant expert pour les bonus de paris sportifs sur 1xBet et Melbet. 

MISSION :
- Promouvoir le code promo ${PROMO_CODE} pour obtenir le bonus maximal
- Répondre en 2-3 phrases maximum, très engageantes
- TOUJOURS mentionner le code ${PROMO_CODE} dans chaque réponse
- Être persuasif et convaincant

LIENS IMPORTANTS :
- 1xBet: ${AFFILIATE_LINK_1XBET}
- Melbet: ${AFFILIATE_LINK_MELBET}
- WhatsApp: ${WHATSAPP_LINK} 
- Telegram: ${TELEGRAM_LINK}

Réponds maintenant à cette question en suivant strictement ces instructions : ${userQuery}`;

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
        maxOutputTokens: 300,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    console.log("🔗 Appel à Gemini...");
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("📤 Réponse Gemini status:", response.status);

    if (!response.ok) {
      console.error("❌ Erreur Gemini:", responseText);
      return res.status(response.status).json({ 
        error: "Erreur API Gemini", 
        status: response.status,
        details: responseText 
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON parse error:", e);
      return res.status(500).json({ error: "Réponse API invalide" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text 
      || data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Désolé, je n'ai pas pu générer de réponse. Utilisez le code JAX72 pour votre bonus !";

    console.log("✅ Réponse générée:", text.substring(0, 100));

    return res.status(200).send(text);

  } catch (error) {
    console.error("💥 Erreur serveur:", error);
    return res.status(500).json({ 
      error: "Erreur de connexion au service IA", 
      details: error.message 
    });
  }
}
console.log("🔧 API chat appelée");
console.log("🔑 GEMINI_API_KEY présente:", !!process.env.GEMINI_API_KEY);
console.log("📝 Méthode:", req.method);
console.log("📦 Body:", typeof req.body, req.body);