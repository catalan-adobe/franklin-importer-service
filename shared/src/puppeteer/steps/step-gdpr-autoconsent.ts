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
import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import fetch from 'cross-fetch';

export function GDPRAutoConsent() {
  return function(action) {
    return async (params) => {
      const blocker = await PuppeteerBlocker.fromLists(fetch, [
        'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt'
      ]);
  
      await blocker.enableBlockingInPage(params.page);
  
      await action(params);
  
      return params;
    };
  }
}
