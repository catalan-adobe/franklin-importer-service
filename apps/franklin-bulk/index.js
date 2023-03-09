#!/usr/bin/env node

// imports
const fs = require('fs');
const readline = require('readline');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { terminal } = require('terminal-kit');
const { Worker } = require('worker_threads');

// constants
const FRANKLIN_STAGE_PREVIEW = 'preview';
const FRANKLIN_STAGE_LIVE = 'live';

/*
 * Worker handlers
 */

function workerMsgHandler(worker, urls, results, result) {
  // store the result
  const idx = results.findIndex((r) => r.url === result.url);
  if (idx > -1) {
    /* eslint-disable-next-line no-param-reassign */
    results[idx].status = result;
  }

  // If there are more URLs, send one to the worker
  if (urls.length > 0) {
    const url = urls.shift();
    results.push({ url, status: null });
    worker.postMessage({
      line: urls.length - urls.length,
      url,
    });
  } else {
    // If there are no more URLs, terminate the worker
    worker.postMessage({ type: 'exit' });
  }
}

function workerExitHandler(workers) {
  workers.shift();
}

/*
 * Helper functions
 */

function publishOptions() {
  return yargs
    .option('interactive', {
      alias: 'i',
      describe: 'Start the application in interactive mode, you will be prompted to copy/paste the list of URLs directly in the terminal. Enter an empty line to finish the process',
      type: 'boolean',
    })
    .option('file', {
      alias: 'f',
      describe: 'Path to a text file containing the list of URLs to deliver (urls pattern: "https://<branch>--<repo>--<owner>.hlx.page/<path>")',
      type: 'string',
    })
    .conflicts('f', 'i')
    .option('workers', {
      alias: 'w',
      describe: 'Number of workers to use (max. 5)',
      type: 'number',
      default: 1,
      coerce: (value) => {
        if (value > 5) {
          terminal.yellow('Warning: Maximum number of workers is 5. Using 5 workers instead.\n');
          return 5;
        }
        return value;
      },
    });
}

async function readLines() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lines = [];

  terminal.brightBlue('Enter a list of URLs (urls pattern: "https://<branch>--<repo>--<owner>.hlx.page/<path>"). Enter an empty line to proceed:\n');

  /* eslint-disable-next-line no-restricted-syntax */
  for await (const input of rl) {
    if (input === '') {
      break;
    }
    lines.push(input);
  }

  rl.close();

  return lines;
}

/*
 * Main
 */

(async function main() {
  let urls = [];

  // CLI parameters
  const { argv } = yargs(hideBin(process.argv))
    .command(FRANKLIN_STAGE_PREVIEW, 'Preview documents in Franklin', publishOptions)
    .command(FRANKLIN_STAGE_LIVE, 'Publish documents in Franklin', publishOptions)
    .help('h');

  // set delivery stage
  const stage = argv._[0];

  // parse URLs
  if (argv.interactive) {
    urls = await readLines();
  } else if (argv.file) {
    // Read the list of URLs from the file
    urls = fs.readFileSync(argv.file, 'utf-8').split('\n').filter(Boolean);
  } else {
    yargs.showHelp('log');
    terminal.yellow('Please specify either a file or interactive mode\n');
    process.exit(1);
  }

  // Array to keep track of the worker threads
  const workers = [];
  const results = [];

  /*
  * Init workers
  */

  const numWorkers = argv.workers;

  terminal.green(`Processing ${urls.length} url(s) with ${numWorkers} worker(s)...\n`);

  // Start the workers
  for (let i = 0; i < numWorkers; i += 1) {
    const worker = new Worker(`${__dirname}/worker.js`);
    workers.push(worker);
    // Handle worker exit
    worker.on('exit', workerExitHandler.bind(null, workers));
    // Listen for messages from the worker thread
    worker.on('message', workerMsgHandler.bind(null, worker, urls, results));
  }

  // Send a URL to each worker
  for (let i = 0; i < numWorkers; i += 1) {
    const url = urls.shift();
    if (url) {
      results.push({ url, status: null });
      workers[i].postMessage({
        idx: i + 1,
        stage,
        line: urls.length - urls.length,
        url,
      });
    } else {
      // If there are no more URLs, terminate the worker
      workers[i].postMessage({ type: 'exit' });
    }
  }

  // Handle ordered output
  const interval = setInterval(() => {
    while (results.length > 0 && results[0].status !== null) {
      const result = results.shift();
      if (result.status.passed) {
        terminal(` ✅  ${result.url}\n`);
      } else {
        terminal(` ❌  ${result.url} - ^rError: ${result.status.result}^:\n`);
      }
    }

    if (workers.length === 0) {
      clearInterval(interval);
    }
  }, 10);
}());
