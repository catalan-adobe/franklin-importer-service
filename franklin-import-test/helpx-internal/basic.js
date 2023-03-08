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
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */


export async function awaitElement(selector, main, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeWas = new Date();
    const wait = setInterval(function() {

      console.log('poll check', main.querySelector(selector));
      if (main.querySelector(selector)) {
        console.log("resolved after", new Date() - timeWas, "ms");
        clearInterval(wait);
        resolve();
      } else if (new Date() - timeWas > timeout) { // Timeout
        console.log("rejected after", new Date() - timeWas, "ms");
        clearInterval(wait);
        reject();
      }
    }, 200);
  });
}

export default {
  postLoadScript: (async (document) => {
    try {
      await awaitElement('.faas-form-settings', main, 2500);
      await awaitElement('.faas-form', main, 2500);
    } catch (e) {
      console.error('no form found!', url);
    }
  }),

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.body;

    /*
      clean
    */
    
    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      // headers / footers
      '.globalnavheader',
      '.globalnavfooter',
      '.globalNavFooter',
      '.globalNavHeader',
      '#global-footer',
      'header',
      'footer',
      '.feds-header-wrapper',

      '.modalContainer',
      '.animation',
      '.tableOfContents-mobile-drawer',
      '.TableOfContents',
      '.toc',
      'locale-modal',
      '.legal-notices',
      'img[style="display:none"]',
      'img[style="display:none;"]',
      'img[style="display:none;"]',
      'img[style="display: none;"]',
      'img[height="0"][width="0"]',
      'img[src*="icon"]',
      'iframe',
      'script',
      'style',
      'link',
      'consonant-card-collection',
      '#adbMsgClientWrapper',
      '.helpx-note',
      '#onetrust-consent-sdk',
      '#ot-general',
      '#ot-enable-disabled',
      // right top side menu, display none in original page
      '.plan-card',
      // '.position:has(.xfreference)',
      '#sidebar',
      '#internal-article-bar-container'
      // '#creativecommons',
      // 'cs-native-frame-holder'
      
    ]);

    return main;
  },

};
