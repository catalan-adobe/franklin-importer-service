/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import chromium from 'chromium';
import puppeteer from 'puppeteer-core';



/*
 * CORE
 */

export async function initBrowserAgent(options) {
  /*
    init
  */

  // const chromium = await import('chromium');
  const headless = options?.headless === false ? false : true;
  // set browser window size
  const width = options?.width || 1200;
  const height = options?.height ? options.height + 79 : 1079;

  // default browser options
  const browserLaunchOptions = {
    headless,
    executablePath: chromium.path,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--no-default-browser-check',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  };
  browserLaunchOptions.args.push(`--window-size=${width},${height}`);

  // init browser
  const browser = await puppeteer.launch(browserLaunchOptions);
  const page = await browser.newPage();

  /*
    clean up user agent
  */

  if (headless) {
    let ua = await browser.userAgent();
    ua = ua.replace(/headless/gi, '');

    await page.setUserAgent(ua);

    console.log('Cleaned up User Agent:', ua);
  }

  return [browser, page];
}



/*
 * DOM SNAPSHOT
 */

function getRectfromArray(a) {
  // context.log(a);
  const r = {
    x: a[0],
    y: a[1],
    width: a[2],
    height: a[3],
  };
    // context.log(r);
  return r;
}

export function getMostBottomElement(snapshot) {
  const docs = snapshot.documents;
  const { strings } = snapshot;
  const mostBottomNode = {
    nodeId: null,
    rect: null,
    backendNodeId: null,
  };

  for (const doc of docs) {
    const { layout } = doc;

    for (let i = 0; i < doc.nodes.nodeType.length; i += 1) {
      /*
        check if node is candidate for most bottom
      */

      // skip node without layout (not rendered?)
      const nodeLayoutIndex = layout.nodeIndex.findIndex((x) => x === i);
      if (nodeLayoutIndex === -1) {
        /* eslint no-continue: "off" */
        continue;
      }

      // skip pseudo node
      // set node name
      let nodeName = '';
      if (doc.nodes.nodeName[i] > -1) {
        nodeName = strings[doc.nodes.nodeName[i]];
      }
      if (nodeName.indexOf('::') > -1) {
        /* eslint no-continue: "off" */
        continue;
      }

      /*
        compute most bottom node
      */

      if (layout.offsetRects[nodeLayoutIndex].length > 0) {
        if (mostBottomNode.nodeId === null) {
          mostBottomNode.nodeId = i;
          mostBottomNode.rect = getRectfromArray(layout.offsetRects[nodeLayoutIndex]);
          mostBottomNode.backendNodeId = doc.nodes.backendNodeId[i];
        } else {
          const currentBottom = mostBottomNode.rect.y;
          const newBottom = layout.offsetRects[nodeLayoutIndex][1];

          if (newBottom > currentBottom) {
            mostBottomNode.nodeId = i;
            mostBottomNode.rect = getRectfromArray(layout.offsetRects[nodeLayoutIndex]);
            mostBottomNode.backendNodeId = doc.nodes.backendNodeId[i];
          }
        }
      }
    }
  }

  return mostBottomNode;
}
