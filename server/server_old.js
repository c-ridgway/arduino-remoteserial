const http = require('http');
const url = require('url');
const util = require('util');
const { exec } = require('child_process');
const pexec = util.promisify(exec);

const port = 10000;
const pathEndpoint = '/remoteserial'; // This may be used as a baseline password for bad actors (insecure)
const enableShellCommands = false; // This will allow your remote device to run commands on this machine (insecure, LAN only, do not use this on portforwarded WAN devices without additional security)

async function handlePayload(payload) {
  let response = '';
  
  if (payload === '[clear]') {
    //console.clear();
    clearConsole();
  } else if (payload.startsWith('[shell=') && payload.endsWith(']')) {
    if (!enableShellCommands) {
      response = `{"error": "Shell commands disabled, blocked '${payload}'.`;
    } else {
      const index = payload.indexOf('=');
      
      if (index !== -1) { // Found
        let command = payload.substring(index).slice(1, -1);
        
        console.log(`Remote shell: '${command}'`);
        
        try {
          const { stdout } = await pexec(command);
          response = `{"result": ${JSON.stringify(stdout)}}`;
        } catch (error) {
          response = `{"error": "Executing command: ${error}"}`;
        }
      }
    }
  }
  
  console.log(payload);
  console.log(response);
  
  return response;
}

function clearConsole() {
  // Check the operating system and execute the appropriate shell command
  const command = 'clear';

  // Execute the shell command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.log(stdout);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === pathEndpoint) {
    const payload = parsedUrl.query.payload || '';
    
    if (payload) {
      const response = await handlePayload(payload);
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(response);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('{"error": "Missing ?payload=value"}');
    }
  } else if (req.method === 'POST' && req.url === pathEndpoint) {
    let payload = '';
    
    req.on('data', (chunk) => {
      payload += chunk;
    });

    req.on('end', async () => {
      if (payload) {
        const response = await handlePayload(payload);
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(response);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('{"error": "Missing payload attribute in POST body"}');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('{"error": "Route not found"}');
  }
});

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}${pathEndpoint}`);
});
