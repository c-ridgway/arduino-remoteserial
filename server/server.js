const http = require('http');
const url = require('url');
const utils = require('./Utils.js');

const port = 10000;
const endpoint = '/remoteserial'; // This may be used as a baseline password for bad actors (insecure)
const enableShellCommands = false; // This will allow your remote device to run commands on this machine (insecure, LAN only, do not use this on portforwarded WAN devices without additional security)

//'[#13F700]Hi[#F74B00]Test[#]Normal'

// Handle functions from the device library
const handlers = {
  println(data) {
    console.log( utils.color.textToCommandLineColor(data.payload) );
  },
  print(data) {
    process.stdout.write(data.payload);
  },
  cprintln(data) {
    console.log( utils.color.processMessageColors(data.payload) );
  },
  cprint(data) {
    process.stdout.write( utils.color.processMessageColors(data.payload) );
  },
	clear(data) {
    utils.console.clearFull();
  },
	async shell(data) {
    let response = '{}';
    
    if (!enableShellCommands) {
      console.log(`Remote shell: '${data.payload}'`);
      
      try {
        const { stdout, stderr } = utils.shell.pexec(data.payload);
        response = `{"result": ${JSON.stringify(stdout)}}`;
      } catch(e) {
        console.log(e);
        
        response = `{"error": "${e}"}`;
      }
    }
    
    console.log(response);
    
    return response;
  }
};

// Identify the handler and call with the payload
async function handleRequest(data) {
  if (data.handler in handlers) {
    return (await handlers[data.handler](data)) || '{"success": true}';
  } else {
    throw new Error(`Unknown handler: ${data.handler}`);
  }
}

// Start listen server for message events
const server = http.createServer(async (req, res) => {
  
  if (req.method === 'POST' && req.url === endpoint) {
    // Post request
    let message = '';
    
    req.on('data', (chunk) => {
      message += chunk;
    });

    req.on('end', async () => {
      try {
        // Process message
        if (message) {
          const data = JSON.parse(message);

          if (data.payload === undefined) {
            throw new Error('Missing payload attribute');
          }

          const response = await handleRequest(data); // Give the data to the correct function
          
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(response);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('{"error": "Missing data"}');
        }
      } catch(e) {
        console.log(e);
        
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(`{"error": "${e}"}`);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('{"error": "Route not found"}');
  }
  
});

server.listen(port, () => {
  console.log(`Server is listening: http://${utils.network.getLocalIpAddressV4()}:${port}${endpoint}`);
});
