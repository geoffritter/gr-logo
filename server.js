import http from 'http';
import path, { resolve } from 'path';
import fs from 'fs';
import crypto from 'crypto';

let srvpath = process.env.npm_package_config_http;
let port = process.env.npm_package_config_port;
let watch = process.env.npm_package_config_watch;
let websocketPort = process.env.npm_package_config_websocketport;

let watchdirs = process.env.npm_package_config_watchdirs;
if (watchdirs) {
  watchdirs = watchdirs.split(':');
} else {
  watchdirs = srvpath;
}


const mimeTypes = {
  'html': 'text/html',
  'ico': 'image/png',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'json': 'application/json',
  'wasm': 'application/wasm',
  'js': 'text/javascript',
  'css': 'text/css'
};

const serveDir = path.join(process.cwd(), srvpath);

function errorPages(err, response) {
  switch (err.code) {
    case 'ENOENT':
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.write('404 Not Found\n');
      break;
    default:
      response.writeHead(500, {'Content-Type': 'text/plain'});
      response.write(`500 Internal Server Error\n Unhandeled case: ${err.code}`);
      break;
  }
}


const reloaderScript = (() => {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'reloader.html'), 'binary').replace('%port%', websocketPort);
  } catch {
    return '';
  }
})();

const reloaderScriptHash = (() => {
  let script = reloaderScript.replace(/<\/?script>/g, '');
  return 'sha256-' + crypto.createHash('sha256').update(script).digest('base64');
})();

(async () => {
  if (watch) {
    await import('ws').then(module => {
      const wss = new module.WebSocketServer({
        port: websocketPort,
        clientTracking: true
      });

      let notifyClients = () => {
          // TODO: Optionally watch only file types we care about.
          wss.clients.forEach(ws => {
            ws.send('reload');
          });
      };

      let watchDirectory = dir => {
        let fullpath = path.join(process.cwd(), dir);
        // Watch source directory changes and notify WebSocket clients.
        try {
          // Windows/OSX support recurisve directory watching.
          fs.watch(fullpath, { recursive: true }, notifyClients);
        } catch (err) {
          if (err.code === 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM') {
            // Workaround for unsupported fs.watch recursive.
            let watchThem = (function getAllDirs(dirPath, list) {
              fs.readdirSync(dirPath, {withFileTypes: true})
                .forEach(file => {
                  if (file.isDirectory()) {
                    let nextDirPath = path.join(dirPath, file.name);
                    list.push(nextDirPath);
                    list = getAllDirs(nextDirPath, list);
                  }
                });
              return list;
            })(fullpath, [fullpath]);
            watchThem.forEach(function watchDirAndNotifyClients(dir) {
              fs.watch(dir, { recursive: false }, (type, filename) => {
                // Add a new directory to watch.
                if (type === 'rename') {
                  // Warning: Some rename events dir will already contain filename. This only happens on deletes which would
                  // already be accounted for by isDirectory. I'm sure this could be made better.
                  let filepath = path.join(dir, filename);
                  try {
                    if (fs.statSync(filepath).isDirectory()) {
                      watchDirAndNotifyClients(filepath);
                    }
                  } catch (err) {
                    if (err.code === 'ENOENT') {
                      // The file was removed.  If it was a directory, I assume the watcher was as well.
                      (()=>{})('noop');
                    }
                  }
                }
                notifyClients();
              });
            });
          }
        }
      };
      for (let dir in watchdirs) {
        watchDirectory(watchdirs[dir]);
      }
    });
}})();


const server = http.createServer((request, response) => {
  let host = `http://${request.headers.host}`;
  // Check if socket request.
  if (request.url === '/socket') {
    // TODO: Use a proxy server to handle listening on one port. Until then, just send an error.
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.write('400: Bad Request. Connecting to websocket on wrong port.');
    response.end();
    return;
  }

  if (request.url === '/reload') {
    response.writeHead(200, { 'Content-Type': 'text/plain', 'Clear-Site-Data': '"*"' });
    response.end();
    return;
  }

  var filename = path.join(serveDir, request.url);

  try {
    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }
  } catch (err) {
    errorPages(err, response);
    response.end();
    return;
  }
  
  fs.readFile(filename, 'binary', function(err, file) {
    if(err) {
      errorPages(err, response);
    } else {
      let mimeType = mimeTypes[filename.split('.').pop()];
      if (!mimeType) {
        mimeType = 'text/plain';
      }
      let nonce = crypto.randomBytes(16).toString('base64');
      let headers = {
        'Content-Type': mimeType,
        'Content-Security-Policy': `script-src ${host} 'nonce-${nonce}'`
      };

      if (mimeType === 'text/html' && request.headers['x-requested-with'] !== 'XMLHttpRequest') {
        file = file.replace(/%nonce%/g, nonce);
        if (watch) {
          headers['Content-Security-Policy'] += ` '${reloaderScriptHash}'`;
          let endOfHead = file.indexOf('</head>');
          file = file.substring(0, endOfHead) + reloaderScript + file.substring(endOfHead);
        }
        // Chrome Bug / Missing Feature: wasm-unsafe-eval
        // https://www.chromestatus.com/feature/5499765773041664
        // https://bugs.chromium.org/p/chromium/issues/detail?id=841404
        // The work around is to add 'unsafe-eval' to your policy. This is not ideal and should be fixed when chrome fixes it.
        headers['Content-Security-Policy'] += ` 'unsafe-eval'`
      }
      response.writeHead(200, headers);
      // response.writeHead(200, { 'Content-Type': mimeType });
      response.write(file, 'binary');
    }
    response.end();
  });
});

server.listen(port);

console.log(`Static file server running at\n  => http://localhost: ${port} \nCTRL + C to shutdown`);
