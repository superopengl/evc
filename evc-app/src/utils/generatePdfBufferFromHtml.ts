import * as puppeteer from 'puppeteer';

export async function generatePdfBufferFromHtml(html): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'domcontentloaded'
    });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      }
    });
    // puppeteer 23+ returns a Uint8Array here, but callers (res.send, nodemailer
    // attachments) and generateReceiptPdfStream's signature all expect a Buffer.
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
