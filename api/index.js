export default async function handler(req, res) {
  // 1. Ξεκλειδώνουμε πλήρως το CORS για να σε αφήνει ο browser (Base44, localhost, κλπ)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, User-Agent');

  // Αν ο browser κάνει προκαταρκτικό έλεγχο (Preflight OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Παίρνουμε το RSS URL από το query string (?url=...)
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: "error", message: "Missing 'url' parameter." });
  }

  try {
    // 3. Φέρνουμε το XML με custom User-Agent για να προσπερνάμε τα blocks των μεγάλων sites
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OmniAI-Fetcher/8.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Target site responded with status: ${response.status}`);
    }
    
    const xmlText = await response.text();

    // 4. Επιστρέφουμε καθαρό XML content με σωστό charset
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=60'); // Cache 60 δευτερόλεπτα στη Vercel για απίστευτη ταχύτητα
    res.status(200).send(xmlText);

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}

