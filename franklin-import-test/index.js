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

console.log("Start browser script");

const [browser, page] = await importerLib.Puppeteer.initBrowser();

await importerLib.Puppeteer.runStepsSequence(page, testUrl, 
  [
    importerLib.Puppeteer.Steps.postLoadWait(2000),
    importerLib.Puppeteer.Steps.smartScroll,
    importerLib.Puppeteer.Steps.franklinImportPage({
      importerSrcFolder: process.cwd()+'/helpx-internal/import.js'
    }),
  ]);

// cool down
await importerLib.Time.sleep(2000);

await browser.close();

console.log("Stop browser script");
