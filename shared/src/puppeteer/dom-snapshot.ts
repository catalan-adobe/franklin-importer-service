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

function getRectfromArray(a) {
  const r = {
    x: a[0],
    y: a[1],
    width: a[2],
    height: a[3],
  };
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
