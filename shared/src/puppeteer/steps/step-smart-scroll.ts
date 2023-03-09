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
import { getMostBottomElement } from '../dom-snapshot.js';
import { sleep } from '../../time.js';

type SmartScrollStepOptions = {
  postReset?: boolean;
};

export function smartScroll({ postReset = true }: SmartScrollStepOptions = {}) {
  return function(action) {
    return async (params) => {
      try {
        params.logger.info('start smart scroll');
  
        const client = await params.page.target().createCDPSession();
        await client.send('DOMSnapshot.enable');
    
        params.logger.info('DOMSnapshot.enable');
    
        const newParams = await action(params);
        if (newParams.result && !newParams.result.passed) {
          params.logger.warn(`smart scroll - previous action failed, do not continue!`)
          return newParams;
        }
    
        const response = await client.send('DOMSnapshot.captureSnapshot', {
          computedStyles: ['top', 'bottom', 'x', 'y'],
          includeDOMRects: true,
          includeTextColorOpacities: true,
          includePaintOrder: true,
          includeBlendedBackgroundColors: true,
        });
    
        const mostBottomNode = getMostBottomElement(response);
    
        /*
          scroll
        */
    
        let scrollOffset = mostBottomNode.rect.y;
        while (scrollOffset > -500) {
          /* eslint no-await-in-loop: "off" */
          await params.page.waitForTimeout(50);
          await client.send('DOM.scrollIntoViewIfNeeded', {
            backendNodeId: mostBottomNode.backendNodeId,
            rect: {
              x: mostBottomNode.rect.x,
              y: -1 * scrollOffset,
              width: 0,
              height: 0,
            },
          });
    
          scrollOffset -= 500;
        }
    
        await sleep(250);

        if (postReset) {
          await params.page.evaluate(() => {
            window.scrollTo(0, 0);
          });
          await sleep(1000);
        }

        await client.send('DOMSnapshot.disable');
    
        params.logger.info('stop smart scroll');  
      } catch(e) {
        params.logger.error('smart scroll catch', e);
        params.result = {
          passed: false,
          error: e,
        };
      } finally {
        params.logger.info('smart scroll finally');
        return params;
      }
    };
  }
}
