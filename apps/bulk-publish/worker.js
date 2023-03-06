const { parentPort } = require('worker_threads');
const axios = require('axios');

const FRANKLIN_API_HOST = "https://admin.hlx.page";

// variables for this worker instance
let franklinStage = null;

/*
 * Worker thread
 */

// Listen for messages from the parent thread
parentPort.on('message', async (msg) => {
  if (msg && msg.type === 'exit') {
    // If the parent thread sent 'exit', exit the worker thread
    process.exit();
  } else {
    if (msg.stage) {
      franklinStage = msg.stage;
    }

    try {
      const url = buildAPIURL(franklinStage, msg.url);

      const response = await axios.post(url);

      parentPort.postMessage({
        url: msg.url,
        passed: true,
        result: `Success: ${response.status}`
      });
    } catch(error) {
      parentPort.postMessage({
        url: msg.url,
        passed: false,
        result: error.message,
      });
    }
  }
});

/*
 * Helper Functions
 */

function buildAPIURL(stage, url) {
  const u = new URL(url);
  const [branch, repo, org] = u.host.split('.')[0].split('--');
  return [FRANKLIN_API_HOST, stage, org, repo, branch].join('/') + u.pathname;
}
