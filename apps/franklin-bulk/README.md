Franklin Bulk Operations CLI
===

```
npx franklin-bulk
```

### Usage

```
franklin-bulk [command]

Commands:
  index.js preview  Preview documents in Franklin
  index.js live     Publish documents in Franklin

Options:
      --version  Show version number                                   [boolean]
  -h             Show help                                             [boolean]
```


### Local Development

#### Install

```
npm install
```

#### Run

```
node index.js
```
### TODOs

* [ ] Add unit tests
* [ ] Add reporting (csv, xlsx?) to, for example help re-run operations on failed URLs
* [ ] Accept non Franklin URLs (user would then pass org, repo, branch as parameters)
