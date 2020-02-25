#!/usr/bin/env node

const host = process.argv[2];
const pageId = process.argv[3];
const apiKey = process.argv[4];
const email = process.argv[5];
const buildUrl = process.argv[6];

console.log(buildUrl);
const https = require('https');

async function loadCurrent() {
  const authorization = 'Basic ' + Buffer.from(email + ':' + apiKey).toString('base64');
  const headers = {'Host': host, 'Authorization': authorization};

  const options = {
    hostname: host,
    path: `/wiki/rest/api/content/${pageId}`,
    method: 'GET',
    headers: headers
  };

  return new Promise((resolve, reject) => {
    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data))
      });

    }).on('error', (err) => {
      console.log("Error: " + err.message);
      reject(err);
    });
  });
}

async function updateVersion(title, newVersion) {
  const authorization = 'Basic ' + Buffer.from(email + ':' + apiKey).toString('base64');
  const headers = {'Host': host, 'Authorization': authorization, 'Content-Type': 'application/json'};

  const options = {
    hostname: host,
    path: `/wiki/rest/api/content/${pageId}`,
    method: 'PUT',
    headers: headers
  };

  const data = JSON.stringify({
                                "id": `${pageId}`,
                                "type": "page",
                                "title": `${title}`,
                                "body": {
                                  "storage": {
                                    "value": `<p>${buildUrl}</p>`,
                                    "representation": "storage"
                                  }
                                },
                                "version": {"number": newVersion}
                              });
  console.log(data);
  return new Promise((resolve, reject) => {
    const req = https.request(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data))
      });

    }).on('error', (err) => {
      console.log("Error: " + err.message);
      reject(err);
    });
    req.end(data)
  });
}

async function main() {
  const current = await loadCurrent();
  const version = parseInt(current.version.number, 10) || null;
  console.log('Current version is: ', version);
  const newVersion = version + 1;
  console.log('Next version is: ', newVersion);
  const update = await updateVersion(current.title, newVersion);
  console.log(update)
}

main();
