#!/usr/bin/env node

const host = process.argv[2];
const pageId = process.argv[3];
const apiKey = process.argv[4];
const email = process.argv[5];

const buildUrl = process.argv[6];
const appTitle = process.argv[7];
const buildNumber = process.argv[8];
const commitMsg = process.argv[9];

const https = require('https');

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day + ' ' + year;
}

async function loadCurrent(opt) {
  const authorization = 'Basic ' + Buffer.from(email + ':' + apiKey).toString('base64');
  const headers = {'Host': host, 'Authorization': authorization};
  const opts = opt || "";

  const options = {
    hostname: host,
    path: `/wiki/rest/api/content/${pageId}${opts}`,
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

async function loadCurrentContent() {
  return await loadCurrent("?expand=body.storage,history");
}

async function loadCurrentVersion() {
  return await loadCurrent();
}

async function updateVersion(title, current, newVersion) {
  const authorization = 'Basic ' + Buffer.from(email + ':' + apiKey).toString('base64');
  const headers = {'Host': host, 'Authorization': authorization, 'Content-Type': 'application/json'};

  const options = {
    hostname: host,
    path: `/wiki/rest/api/content/${pageId}`,
    method: 'PUT',
    headers: headers
  };
  const date = formatDate(new Date());
  const content = `<h4>${appTitle} #${buildNumber}</h4>
<div>
<h6>${date}</h6>
${commitMsg}
<a href="${buildUrl}#?tab=artifacts">
${buildUrl}
</a>
</div><hr />${current}`;

  const data = JSON.stringify({
                                "id": `${pageId}`,
                                "type": "page",
                                "title": `${title}`,
                                "body": {
                                  "storage": {
                                    "value": content,
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
  const currentVersion = await loadCurrentVersion();
  const version = parseInt(currentVersion.version.number, 10) || null;
  console.log('Current version is: ', version);
  const newVersion = version + 1;
  console.log('Next version is: ', newVersion);

  const currentContent = await loadCurrentContent();
  console.log(currentContent);
  const update = await updateVersion(currentContent.title, currentContent.body.storage.value, newVersion);
  console.log(update)
}

main();