//
//
//
// automat.finance server.js
//
// created on: 2-9-2021
//
//
// Node Dependencies
const Fs = require('fs');
const Https = require('https');
//
//
// NPM Dependencies
const Helmet = require('helmet');
const Express = require('express');

//
//
// Custom Dependencies
const cfg = require('./custom_modules/cfg/');
const api = require('./custom_modules/api/');
//
//
// Application Objects
let app = null;
let server = null;
//
//
//
// Configure Express App
app = Express();
app.use(Helmet()); // defend against basic attacks
app.use(Express.static('./public/')); // statically serve the ./public directory as webroot
//
//
//
app.route('/abi/cryptic').get(api.cryptic_abi);
app.route('/net/cryptic').get(api.cryptic_net);

app.route('/abi/payment').get(api.payment_abi);
app.route('/net/payment').get(api.payment_net);
//
//
// Configure HTTPS server with SocketIO integrated
server = Https.createServer(cfg.server.ssl, app);
//
//
//
server.listen(cfg.server.port, () => console.log(cfg.server.launchmsg));