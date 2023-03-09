// @ts-check
import * as importerLib from 'franklin-importer-shared';

/* 
  arguments
*/

const myArgs = process.argv.slice(2);

let testUrl = myArgs[0] || process.env["TEST_URL"];

if (!testUrl) {
  console.log(`Missing test URL`);
  process.exit(1);
}

/*
 * main
 */

const OUTPUT_FOLDER = process.cwd()+'/output';

console.log("Start browser script");

const [browser, page] = await importerLib.Puppeteer.initBrowser({ headless: false });

await importerLib.Puppeteer.runStepsSequence(page, testUrl, 
  [
    importerLib.Puppeteer.Steps.GDPRAutoConsent(),
    importerLib.Puppeteer.Steps.postLoadWait(500),
    importerLib.Puppeteer.Steps.execAsync(async(page) => {
      await page.keyboard.press("Escape");
    }),
    importerLib.Puppeteer.Steps.smartScroll(),
    importerLib.Puppeteer.Steps.franklinImportPage({
      importerSrcFolder: process.cwd()+'/helpx-internal/import.js',
      outputFolder: OUTPUT_FOLDER,
      saveMD: true,
    }),
    importerLib.Puppeteer.Steps.webConsoleMessages({
      outputFolder: OUTPUT_FOLDER,
    }),
    importerLib.Puppeteer.Steps.fullPageScreenshot({
      outputFolder: OUTPUT_FOLDER,
    }),
  ]);

// cool down
await importerLib.Time.sleep(1000);

await browser.close();

console.log("Stop browser script");
