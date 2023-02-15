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

import parse from 'parse-duration';

export function sleep(ms) {
  return new Promise(
    (resolve) => {
      setTimeout(resolve, ms);
    },
  );
}

export function randomSleep(minDuration, maxDuration) {
  let min = minDuration || null;
  let max = maxDuration || null;

  if (typeof min === 'string') {
    min = parse(min);
  }
  if (min === null) {
    return null;
  }

  if (typeof max === 'string') {
    max = parse(max);
  }
  if (max === null) {
    return null;
  }

  if ((min === 0 && max === 0) || max < min) {
    return null;
  }

  const d = Math.round(min + Math.random() * (max - min));

  return sleep(d);
}
