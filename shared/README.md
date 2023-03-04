Franklin Importer Shared Library
===

Domain specific util functions shared accross Franklin Importer tools



## Install

```
npm install https://gitpkg.now.sh/catalan-adobe/franklin-importer-service/shared
```



## Usage

Sample script that takes a screenshot of the bottom of a page:

```js
// take-screenshot.js

import * as importerLib from 'franklin-importer-shared';
  
// init headless browser
const [browser, page] = await importerLib.Puppeteer.initBrowser();

// load test page
await page.goto('https://www.hlx.live');

// scroll down
await importerLib.Puppeteer.scrollDown(page);

// wait 1s.
await importerLib.Time.sleep(1000);

// take a screenshot
await page.screenshot({
  fullPage: false,
  path: 'screenshot.png'
});

// close browser
await browser.close();
```


## Domains

* Puppeteer (_`initBrowserAgent`_, _`scrollDown`_, _`scrollUp`_)
* Time (_`sleep`_, _`randomSleep`_)