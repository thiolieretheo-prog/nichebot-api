export default async function handler(req, res) {
  try {
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
    const mode = body.mode || 'niches';

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const PERSONA = `Tu es NicheBot, agent IA expert Vinted. Style : direct, sans bullshit, chiffres concrets, actions precises.`;

    const MARKET = `PRIX MARCHE VINTED FRANCE 2025 :
Sneakers Nike Air Max 90/95/97 : achat 10-25€ / revente 45-120€
Jordan 1 : achat 20-50€ / revente 80-200€
Vintage sportswear 90s : achat 2-8€ / revente 25-70€
Levi's 501 vintage : achat 5-12€ / revente 25-55€
Streetwear (Supreme/Palace) : marge élevée`;

    const PROMPTS = {
      niches: `${PERSONA}\n${MARKET}`,
      analyse: `${PERSONA}\n${MARKET}`,
      optimise: `${PERSONA}\n${MARKET}`,
      profit: `${PERSONA}\n${MARKET}`,
      concurrence: `${PERSONA}\n${MARKET}`,
      stock: `${PERSONA}\n${MARKET}`
    };

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: PROMPTS[mode] || PROMPTS.niches,
        messages
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: data.error?.message || 'Anthropic error'
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
}
