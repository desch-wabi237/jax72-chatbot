export default async function handler(req, res) {
  console.log('🔧 API appelée - Méthode:', req.method);
  
  // Headers CORS complets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS préflight handled');
    return res.status(200).end();
  }
  
  // Seulement accepter POST
  if (req.method !== 'POST') {
    console.log('❌ Méthode non autorisée:', req.method);
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      allowed: ['POST'] 
    });
  }

  try {
    console.log('📦 Body reçu:', req.body);
    
    // Parser le body
    let userQuery;
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

    if (!userQuery) {
      return res.status(400).json({ error: 'userQuery est requis' });
    }

    // ✅ RÉPONSE DE TEST - Ça devrait MARCHER !
    const response = `🎉 FÉLICITATIONS ! L'API FONCTIONNE ! 

Votre message: "${userQuery}"
Code promo: **JAX72**

🎰 1xBet: https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573
⚽ Melbet: https://lien-melbet-a-remplacer.com

L'API répond correctement ! Prochaine étape : intégrer Gemini.`;

    console.log('✅ Envoi réponse');
    return res.status(200).send(response);

  } catch (error) {
    console.error('💥 Erreur API:', error);
    return res.status(500).json({ 
      error: 'Erreur interne',
      message: error.message 
    });
  }
}