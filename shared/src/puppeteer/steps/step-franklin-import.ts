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

// import { buildFilenameWithPathFromUrl } from '../utils.mjs';

import pUtils from 'path';
import * as fs from 'fs';
import http from 'http';
import { Buffer } from 'node:buffer';
import { AddressInfo } from 'net'

import finalhandler from 'finalhandler';
import serveStatic from'serve-static';
import sharp from 'sharp';
// import prettier from 'prettier';
import { JSDOM } from 'jsdom';
// import { BlobServiceClient } from '@azure/storage-blob';
import { buildPathAndFilenameWithPathFromUrl } from '../../url.js';

// Franklin import
import {
  DOMUtils,
  FileUtils,
  Blocks,
  html2docx,
} from '@adobe/helix-importer';
// import importer from '../../franklin/import/importer/helpx-internal/import.js';
// import importer from '../../franklin/import/golfdigest.com/import.js';



/*
 * Mimic helix-importer-ui global object WebImporter to enable
 * re-use import scripts without modification
 */
global.WebImporter = {
  Blocks,
  DOMUtils,
};


let mainParams = {
  outputFolder: '',
};

// const docxStylesXML = fs.readFileSync(pUtils.resolve(pUtils.dirname(''), './resources/helix-importer/docstyles.xml'), 'utf-8');

const options = {
  // disable helix-importer function because of getComputedStyle performance issue
  // known jsDOM issue: https://github.com/jsdom/jsdom/issues/3234, https://github.com/jsdom/jsdom/pull/3482
  setBackgroundImagesFromCSS: false,
  // docxStylesXML,
  image2png: async ({ src, data, type }) => {
    // console.log(src, data, type);
    src = decodeURIComponent(src);

    let u = new URL(src);
    let imagePath = pUtils.join(mainParams.outputFolder, u.pathname);
    // console.log(imagePath);

    const img = sharp(imagePath);
    const metadata = await img.metadata();

    // console.log(metadata);

    const width = metadata.width;
    const height = metadata.height;

    const bufData = await img
      // .raw()
      .toFormat('png')
      .toBuffer(/*{ resolveWithObject: true }*/);

    // console.log('info', info);
    console.log('converted', type, 'to png', src, width, height/*, info.size*/);

    return {
      data: bufData,
      width,
      height,
      type: 'image/png',
    };

    // const img = new Image();
    // const blob = new Blob([data], { type });
    // img.src = URL.createObjectURL(blob);
    // img.crossOrigin = 'anonymous';
    // await img.decode();

    // let width = img.naturalWidth;
    // let height = img.naturalHeight;

    // // for some svgs, the natural width / height are not correctly computed
    // if (type === 'image/svg+xml') {
    //   const parser = new DOMParser();
    //   const svg = data.toString('utf-8');
    //   const svgDoc = parser.parseFromString(svg, 'text/html');
    //   const svgTag = svgDoc.querySelector('svg');
    //   const viewBox = svgTag?.getAttribute('viewBox');
    //   if (viewBox) {
    //     const [, , w, h] = viewBox.split(' ').map(Number);
    //     if (w > img.naturalWidth || h > img.naturalHeight) {
    //       width = w;
    //       height = h;
    //     }
    //   }
    // }

    // // note: OffscreenCanvas is not supported on safari
    // const canvas = new OffscreenCanvas(width, height);
    // const ctx = canvas.getContext('2d');
    // ctx.drawImage(img, 0, 0);
    // const newBlob = await canvas.convertToBlob();
    // console.log('converted', type, 'to png', src, width, height, blob.size);
    // return {
    //   data: newBlob.arrayBuffer(),
    //   width,
    //   height,
    //   type: 'image/png',
    // };
  },
};

const makeProxySrcs = async function(main, host, port) {
  const imgs = main.querySelectorAll('img')
  console.log("Images <img/> length: " + imgs.length);
  for (var i = 0; i < imgs.length; i++) {
    console.log("image index: " + i);
    let img = imgs[i];
    img.src = decodeURIComponent(img.src);
    console.log('old img.src', img.src);
    if (img.src.startsWith('//')) {
      // golfdigest.com -  add missing protocol
      img.src = `https:${img.src}`;
    }
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);

      console.log('BEFORE downloadIfNotCachedYet ' + u);
      await downloadIfNotCachedYet(u, mainParams.outputFolder);
      console.log('AFTER downloadIfNotCachedYet' + u);

      u.searchParams.append('host', u.origin);
      let src = `http://localhost:${port}`;
      img.src = pUtils.join(src, u.pathname) + u.search;
      console.log('new img.src', img.src);
    } catch (error) {
      console.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
      continue;
    }
  };
  return;
};

export function franklinImportPage(importerSrcFolder) {
  return function(action) {
    return async (params) => {
      try {
        /*
          before main action
        */
  
        mainParams = params;
  
        params.logger.info('start franklin import page');
    
        const u = new URL(params.url);
        const [path, filename] = buildPathAndFilenameWithPathFromUrl(params.url, '', 'docx');
        const pageLocalFolder = pUtils.join(params.outputFolder, 'docx', path);
        if (!fs.existsSync(pageLocalFolder)){
          fs.mkdirSync(pageLocalFolder, { recursive: true });
        }
      
        // params.logger.info(params.url);
        // params.logger.info(params.outputFolder);
        // params.logger.info(path);
        // params.logger.info(filename);
        // params.logger.info(pageLocalFolder);
      
        /*
          main action
        */
    
        const newParams = await action(params);
        if (newParams.result && !newParams.result.passed) {
          params.logger.warn(`franklin import page - previous action failed, do not continue!`)
          return newParams;
        }
    
        /*
          after main action
        */
    
        // start webserver to serve cached resources
        var serve = serveStatic(params.outputFolder);
        
        // Create server
        var server = http.createServer(function onRequest (req, res) {
          serve(req, res, finalhandler(req, res));
        })
        // Listen
        server.listen(0);
  
        const { port } = server.address() as AddressInfo
  
        params.logger.info(`cache proxy server listening on port ${port}`);
  
  
        params.logger.info("get page content");
  
        // import page
        // get fully rendered dom
        let content = await params.page.content();
    
        /*
          helix import
        */
  
        params.logger.info("new JSDOM");
  
        const dom = new JSDOM(content);
    
        console.log("typeof content");
        console.log(typeof content);
        console.log(typeof dom);
  
        await makeProxySrcs(dom.window.document, u.origin, port);
  
        params.logger.info("Transforming DOM");
  
        // let tDom = importer.transformDOM({
        //   document: dom.window.document,
        //   url: null,
        //   html: null,
        //   params: null,
        // });
    
        console.log(dom.window.document);
      
        params.logger.info("Transformed DOM");
  
        // const resultHtml = tDom.innerHTML; //.serialize();
        // const formattedHtml = prettier.format(resultHtml, { parser: "html" });
        // // params.logger.info(formattedHtml)
      
        params.logger.info("html2docx");
        // const docs = await html2docx(params.url, tDom.innerHTML, {}, options);
        const importer = await import(importerSrcFolder);
        params.logger.info(importer.default);

        const docs = await html2docx(params.url, dom.window.document, importer.default, options);
          
        params.logger.info("Stop proxy server");
  
        server.close();
  
        // params.logger.info(docs.md);
      
        fs.writeFileSync(pUtils.join(pageLocalFolder, filename), docs.docx);
      
        params.logger.info(docs.md);
    
        // const connStr = process.env.AzureWebJobsStorage;
        // const hivesContainer = process.env.HivesContainerName;
        // const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
        // const containerClient = blobServiceClient.getContainerClient(hivesContainer);
        // const blockBlobClient = await containerClient.getBlockBlobClient(pUtils.join(pageLocalFolder, filename));
        // const uploadBlobResponse = await blockBlobClient.uploadFile(pUtils.join(pageLocalFolder, filename));
        // params.logger.info(`Uploaded block blob ${pUtils.join(pageLocalFolder, filename)} successfully`, uploadBlobResponse.requestId);
        
        params.logger.info('stop franklin import page');
      } catch(e) {
        params.logger.error('franklin import catch', e);
        params.result = {
          passed: false,
          error: e,
        };
      } finally {
        params.logger.info('franklin import page finally');
        return params;
      }
  
    };
  }
}

async function downloadIfNotCachedYet(url, cacheFolder) {
  console.log('downloadIfNotCachedYet');
  const imgPath = pUtils.join(cacheFolder, url.pathname);
  console.log('downloadIfNotCachedYet', imgPath);

  // const p = pUtils.parse(imgPath).dir;
  if (!fs.existsSync(pUtils.dirname(imgPath))){
    fs.mkdirSync(pUtils.dirname(imgPath), { recursive: true });
  }

  if (!fs.statSync(imgPath, {throwIfNoEntry: false})) {
    console.log('downloadIfNotCachedYet', 'image not cached yet! download it!');

    console.log('fetch');
    const response = await fetch(url.href);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    console.log('Buffer.from');
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFileSync(imgPath, buffer);
  }
}