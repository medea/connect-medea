# Connect Medea

connect-medea is a Connect session store backed by [Medea](https://github.com/argo/medea), a persistent, embedded key-value store.  This implementation is based on [connect-redis](https://github.com/visionmedia/connect-redis).

## Installation

```bash
$ npm install connect-medea
```

## Options

- `dirname`: The directory to use for Medea's key-value storage.

## Usage

For Connect:

```javascript
var connect = require('connect');
var MedeaStore = require('connect-medea')(connect);

var options = {
  dirname: __dirname + '/data'
};

var store = new MedeaStore(options);

connect()
  .use(connect.session({ store: store, secret: 'el chupacabra' }));
```

For Express:

```javascript
var express = require('express');
var MedeaStore = require('connect-medea')(express);

var options = {
  dirname: __dirname + '/data'
};

var store = new MedeaStore(options);

var app = express();
app.use(express.session({ store: store, secret: 'el chupacabra' }));
```

## License

MIT
