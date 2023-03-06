#!/usr/bin/env node

const terminal = require('terminal-kit').terminal;
const { Worker } = require('worker_threads');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

/*
 * CLI parameters
 */

(async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [-i] [--file urlFile] [--stage <stage>] [--workers <number>]')
    .option('interactive', {
      alias: 'i',
      describe: 'Start the application in interactive mode, you will be prompted to give the list of URLs directly in the application. Enter an empty line to finish the process',
      type: 'boolean',
    })
    .option('file', {
      alias: 'f',
      describe: 'Path to a text file containing a list of URLs (urls pattern: "https://<branch>--<repo>--<owner>.hlx.page/<path>")',
      type: 'string',
    })
    .conflicts('f', 'i')
    .option('stage', {
      alias: 's',
      describe: 'The stage the content will be publised to',
      choices: ['preview', 'live'],
      default: 'preview',
    })
    .option('workers', {
      alias: 'w',
      describe: 'Number of workers to use',
      type: 'number',
      default: 1,
      coerce: (value) => {
        if (value > 5) {
          console.warn('Warning: Maximum number of workers is 5. Using 5 workers instead.');
          return 5;
        } else {
          return value;
        }
      }
    })
    .argv;

  let urls = [];

  if (argv.interactive) {
    urls = await readLines();
  } else if (argv.file) {
    // Read the list of URLs from the file
    urls = require('fs').readFileSync(argv.file, 'utf-8').split('\n').filter(Boolean);
  } else {
    yargs.showHelp("log"); 
    console.log('Please specify either a file or interactive mode');
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
  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__dirname + '/worker.js');
    workers.push(worker);
    // Handle worker exit
    worker.on('exit', workerExitHandler.bind(null, workers));
    // Listen for messages from the worker thread
    worker.on('message', workerMsgHandler.bind(null, worker, urls, results));
  }

  // Send a URL to each worker
  for (let i = 0; i < numWorkers; i++) {
    const url = urls.shift();
    if (url) {
      results.push({url, status: null});
      workers[i].postMessage({
        idx: i+1,
        stage: argv.stage,
        line: urls.length - urls.length,
        url
      });
    } else {
      // If there are no more URLs, terminate the worker
      workers[i].postMessage({type: 'exit'});
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

    if(workers.length === 0) {
      clearInterval(interval);
    }
  }, 10);

})();

/*
 * Worker handlers
 */

function workerMsgHandler(worker, urls, results, result) {
  // store the result
  const idx = results.findIndex(r => r.url === result.url);
  if (idx > -1) {
    results[idx].status = result;
  }

  // If there are more URLs, send one to the worker
  if (urls.length > 0) {
    const url = urls.shift();
    results.push({url, status: null});
    worker.postMessage({
      line: urls.length - urls.length,
      url
    });
  } else {
    // If there are no more URLs, terminate the worker
    worker.postMessage({type: 'exit'});
  }
}

function workerExitHandler(workers) {
  workers.shift();
}

/*
 * Helper functions
 */

async function readLines() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let lines = [];

  terminal.brightBlue('Enter a list of URLs (urls pattern: "https://<branch>--<repo>--<owner>.hlx.page/<path>"). Enter an empty line to proceed:\n');

  for await (const input of rl) {
    if (input === '') {
      break;
    }
    lines.push(input);
  }

  rl.close();

  return lines;
}
