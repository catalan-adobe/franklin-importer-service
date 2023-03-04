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

/*
 * Types
 */

/**
 * @typedef {number | string} Duration - Duration type accepts a number or a string
 * - number - milliseconds
 * - string - will be parsed into milliseconds (ex. '5s' => 5000)
 */
export type Duration = number | string;

/*
 * Functions
 */

/**
 * Waits the given time
 * @param {Duration} [time=1000] - The duration to wait
 * - number - milliseconds
 * - string - will be parsed into milliseconds (ex. '5s' => 5000)
 * @returns {Promise<void>} null or an error in case the duration could not get parsed
 */
export function sleep(time: Duration = 1000): Promise<void> {
  let d: number;
  if (typeof time === 'string') {
    d = parse(time);
  } else {
    d = time;
  }
  if (d === null) {
    return Promise.reject(new Error(`cannot parse duration parameter "${time}"`));
  }

  return new Promise((resolve) => {
    setTimeout(resolve, d);
  });
}

/**
 * Waits a random time between a given range
 * @param {Duration} [minDuration=1000] - The minimum duration to wait
 * - number - milliseconds
 * - string - will be parsed into milliseconds (ex. '5s' => 5000)
 * @param {Duration} [maxDuration=2000] - The maximum duration to wait
 * - number - milliseconds
 * - string - will be parsed into milliseconds (ex. '5s' => 5000)
 * @returns {Promise<void>} null or an error in case a duration could not get parsed
 */
export function randomSleep(
  minDuration: Duration = 1000,
  maxDuration: Duration = 2000,
): Promise<void> {
  let min: number;
  let max: number;

  if (typeof minDuration === 'string') {
    min = parse(minDuration);
  } else {
    min = minDuration;
  }
  if (min === null) {
    return Promise.reject(new Error(`cannot parse min duration parameter "${minDuration}"`));
  }

  if (typeof maxDuration === 'string') {
    max = parse(maxDuration);
  } else {
    max = maxDuration;
  }
  if (max === null) {
    return Promise.reject(new Error(`cannot parse max duration parameter "${maxDuration}"`));
  }

  if ((min === 0 && max === 0) || max < min) {
    return Promise.reject(new Error('min/max range not supported (min > 0 AND max > 0 AND AND min < max)'));
  }

  const d = Math.round(min + Math.random() * (max - min));

  return sleep(d);
}
