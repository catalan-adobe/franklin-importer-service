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

/*
 * Functions
 */

/**
 * Waits the given time
 * @param {number} [time=1000] - The duration to wait, in milliseconds
 * @returns {Promise<void>} null or an error in case the duration could not get parsed
 */
export function sleep(time: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

/**
 * Waits a random time between a given range
 * @param {Duration} [min=1000] - The minimum duration to wait, in milliseconds
 * @param {Duration} [max=2000] - The maximum duration to wait, in milliseconds
 * @returns {Promise<void>} null or an error in case a duration could not get parsed
 */
export function randomSleep(
  min: number = 1000,
  max: number = 2000,
): Promise<void> {
  if ((min === 0 && max === 0) || max < min) {
    return Promise.reject(new Error('min/max range not supported (min > 0 AND max > 0 AND AND min < max)'));
  }

  const d = Math.round(min + Math.random() * (max - min));

  return sleep(d);
}
