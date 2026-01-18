import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { parse as parseQueryString } from 'querystring';
import { spawn } from 'child_process';

const email = process.argv[2] || 'peter@peterhurford.com';

const { GAuthService } = await import('./dist/services/gauth.js');
const gauth = new GAuthService({
  gauthFile: './.gauth.json',
  accountsFile: './.accounts.json',
  credentialsDir: '.'
});
await gauth.initialize();
const url = await gauth.getAuthorizationUrl(email, {});

console.log('');
console.log('=== AUTHENTICATE YOUR GOOGLE ACCOUNT ===');
console.log(`Account: ${email}`);
console.log('');
console.log('Opening browser... If it does not open, visit this URL:');
console.log(url);
console.log('');
console.log('Waiting for authentication callback on port 4100...');

// Open browser
spawn('open', [url]);

const server = createServer(async (req, res) => {
  const parsedUrl = parseUrl(req.url || '');
  if (parsedUrl.pathname !== '/code') {
    res.writeHead(404);
    res.end();
    return;
  }

  const query = parseQueryString(parsedUrl.query || '');
  if (!query.code) {
    res.writeHead(400);
    res.end('Missing code');
    return;
  }

  try {
    await gauth.getCredentials(query.code, {});
    res.writeHead(200);
    res.end('Authentication successful! You can close this tab.');
    console.log('');
    console.log(`SUCCESS: Authentication completed for ${email}`);
    server.close();
    process.exit(0);
  } catch (error) {
    res.writeHead(500);
    res.end('Authentication failed: ' + error.message);
    console.error('FAILED:', error.message);
    server.close();
    process.exit(1);
  }
});

server.listen(4100);
