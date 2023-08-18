/*
Some optional utils to make things spicy.
*/

const { exec } = require('child_process');
const os = require('os');
const util = require('util');
const pexec = util.promisify(exec);

module.exports = {
  color: {
    textToCommandLineColor(message, hex) {
      if (hex === undefined) {
        return message;
      }
      
      if (hex === '') {
        return '\x1b[0m' + message;
      }
      
      return this.hexToCommandLineColor(hex) + message;// + '\x1b[0m';
    },
    hexToCommandLineColor(hex) {
      // Check if the hex code is valid
      if (!/^([0-9A-Fa-f]{6})$/.test(hex)) {
        console.error('Invalid hex color code');
        return;
      }

      // Convert hex to RGB
      let r = parseInt(hex.slice(0, 2), 16);
      let g = parseInt(hex.slice(2, 4), 16);
      let b = parseInt(hex.slice(4, 6), 16);

      // Convert RGB to command line color code
      let commandLineColor = `\x1b[38;2;${r};${g};${b}m`;

      return commandLineColor;
    },
    processMessageColors(message) {
      let tokens = message.split('[#').filter(item => item.length);
      let output = '';
      
      for(const token of tokens) {
        const endIndex = token.indexOf(']');

        if (endIndex !== -1) {
          const hex = token.substring(0, endIndex);
          const message = token.substring(endIndex + 1);
          
          output += this.textToCommandLineColor(message, hex);
        } else {
          throw new Error('No closing bracket found.');
        }
        
        output += '\x1b[0m';
      }
      
      return output;
    }
  },
  shell: {
    async pexec(command) {
      return await pexec(command);
    }
  },
  console: {
    clearFull() {
      // Check the operating system and execute the appropriate shell command
      const command = 'clear';

      // Execute the shell command
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error}`);
          return;
        }
        
        process.stdout.write(stdout);
      });
    }
  },
  network: {
    getLocalIpAddressV4() {
      const networkInterfaces = os.networkInterfaces();

      for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
            return net.address;
          }
        }
      }

      return null;
    }
  }
};