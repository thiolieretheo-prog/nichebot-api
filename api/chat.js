export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body || {};
    const messages = body.messages;
    const mode = body.mode || "niches";

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    // 🔥 TON SYSTEM VINTED (gardé)
    const PERSONA = `Tu es NicheBot, expert Vinted. Style direct, chiffres concrets, actions précises.`;

    const MARKET = `PRIX MARCHE VINTED FRANCE 2025 :
Sneakers Nike Air Max 90/95/97 : achat 10-25€ / revente 45-120€
Jordan 1 : achat 20-50€ / revente 80-200€
Vintage sportswear 90s : achat 2-8€ / revente 25-70€
Levi's 501 : achat 5-12€ / revente 25-55€
Streetwear Supreme/Palace : marge élevée`;

    const SYSTEM_PROMPT = `${PERSONA}\n${MARKET}`;

    // 🔥 APPEL OPENAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
}
