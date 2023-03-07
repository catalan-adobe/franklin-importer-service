Franklin Bulk Publish CLI
===

```
npx https://gitpkg.now.sh/catalan-adobe/franklin-importer-service/apps/bulk-publish?main
```

### Usage

```
Usage: index.js [-i] [--file urlFile] [--stage <stage>] [--workers <number>]

Options:
      --help         Show help                                         [boolean]
      --version      Show version number                               [boolean]
  -i, --interactive  Start the application in interactive mode, you will be
                     prompted to copy/paste the list of URLs directly in the
                     terminal. Enter an empty line to finish the process
                                                                       [boolean]
  -f, --file         Path to a text file containing a list of URLs (urls
                     pattern:
                     "https://<branch>--<repo>--<owner>.hlx.page/<path>")
                                                                        [string]
  -s, --stage        The stage the content will be publised to
                               [choices: "preview", "live"] [default: "preview"]
  -w, --workers      Number of workers to use              [number] [default: 1]
```
