
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, mode } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  const PERSONA = `Tu es NicheBot, agent IA expert Vinted. Style : direct, sans bullshit, chiffres concrets, actions precises. Comme un pote qui a fait 50 000€ sur Vinted et qui te dit exactement quoi faire. Reponds UNIQUEMENT en JSON valide sans markdown ni backticks.`;

  const MARKET = `
PRIX MARCHE VINTED FRANCE 2025 :
Sneakers Nike Air Max 90/95/97 : achat 10-25€ / revente 45-120€ / marge moy 55€
Jordan 1 : achat 20-50€ / revente 80-200€ / marge moy 90€
Vintage sportswear 90s (Fila/Kappa/Umbro) : achat 2-8€ / revente 25-70€ / marge moy 42€
Levi's 501 vintage : achat 5-12€ / revente 25-55€ / marge moy 32€
Vestes jean vintage (Lee/Wrangler) : achat 4-10€ / revente 22-50€ / marge moy 28€
Pulls cardigans oversize vintage : achat 3-7€ / revente 20-45€ / marge moy 27€
Blazers oversize femme : achat 3-8€ / revente 18-38€ / marge moy 22€
Sacs Zara/Mango : achat 5-15€ / revente 18-40€ / marge moy 20€
Sacs luxe (Gucci/LV/Chanel) : achat 40-150€ / revente 120-500€ / marge moy 180€
Vetements enfant lots (Petit Bateau/Jacadi) : achat 1-3€/piece / revente lot 25-60€ / marge moy 35€
Streetwear (Supreme/Palace) : achat 15-40€ / revente 60-200€ / marge moy 95€
Dr Martens : achat 15-25€ / revente 40-80€ / marge moy 40€
Gorpcore (North Face/Patagonia) : achat 8-20€ / revente 35-90€ / marge moy 48€
Y2K : achat 3-8€ / revente 15-40€ / marge moy 22€

FRAIS : expedition moy 4.50€ / frais vendeur 0€
ALGO : publier 18h-21h = +40% vues / 5+ photos = x2 vues / renouveler tous les 3 jours`;

  const PROMPTS = {
    niches: `${PERSONA}\n${MARKET}\nNICHES TRES CHAUDES (<48h) : vintage sportswear 90s, sneakers Nike rares, streetwear, sacs luxe\nNICHES CHAUDES (2-5j) : Levi's 501, vestes jean, vetements enfant lots, blazers, gorpcore\nNICHES STABLES (5-14j) : robes boheme, manteaux laine, Dr Martens, deco vintage, Y2K\nSOURCES : vide-greniers, Leboncoin, Emmaus, ressourceries, Vinted lui-meme`,

    analyse: `${PERSONA}\n${MARKET}\nRATIO ENGAGEMENT = likes/vues x100. Excellent >12% / Bon 7-12% / Moyen 3-7% / Faible <3%\nEvalue marge potentielle vs prix marche. Detecte annonces sous-evaluees et sur-evaluees.`,

    optimise: `${PERSONA}\n${MARKET}\nTITRE : [Marque] [Modele] [Type] [Taille] [Couleur] [Etat] - max 80 chars - marque EN PREMIER\nBOOSTEURS : vintage, rare, authentique, Y2K, 90s, oversize\nPRIX : finir par 9 (19,29,49,69) / marge nego = prix cible +12%`,

    profit: `${PERSONA}\n${MARKET}\nCALCUL : marge brute = revente - achat / profit net = marge brute - expedition / ROI = (profit net / achat) x100\nVERDICT : Excellent (ROI>200%) / Bon (ROI 100-200%) / Moyen (ROI 50-100%) / Pas rentable (ROI<50%)`,

    concurrence: `${PERSONA}\n${MARKET}\nFACTEURS DIFFERENCIATION : prix -10%, 5+ photos, titre complet, reactivite <1h, note 5 etoiles, frequence publication, offres groupees -20%`,

    stock: `${PERSONA}\n${MARKET}\nTu analyses un stock d'articles Vinted et tu donnes des recommandations precises.\nPour chaque article : priorite de mise en vente, prix optimal, categorie, niche associee, conseil specifique.\nCalcule aussi les stats globales : valeur totale du stock, profit potentiel total, articles prioritaires a lister en premier.\nDonne un plan d action clair : quoi publier aujourd'hui, cette semaine, ce mois.`
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Anthropic error' });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
