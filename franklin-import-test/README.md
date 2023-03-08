Franklin Import via Puppeteer
===

## Usage

from `../shared`
```
npm install
npm run build
```

then, from this folder

```
npm install

node index.js <URL_TO_IMPORT>
```

The `.docx` will be generated in the `docx` folder

### Change Import script

In `index.js` adapt the path set in `importerLib.Puppeteer.Steps.franklinImportPage` function
