const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send({ error: 'URL is required' });

  console.log(`Navigating to: ${url}`);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await page.setCookie(...cookies);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const title = await page.title();
    await browser.close();

    res.json({
      status: 'success',
      title,
      message: 'Scraped successfully!'
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Scraping failed' });
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
