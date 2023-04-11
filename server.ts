const fs = require('fs').promises;
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    console.log(123)
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  console.log(payload)
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  console.log(113)
  return client;
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
async function printDocTitle(auth) {
  const docs = google.docs({version: 'v1', auth});
  const res = await docs.documents.get({
    documentId: '1qwWKmInQTVwakzM8OHzISSM6hqHpY6PHh02Ui_bdKgg',
  });
  console.log(133)
  console.log(`The title of the document is: ${res.data.title}`);
}

// Run only when token.json does not exist
authorize().then(client => saveCredentials(client)).catch(console.error);

async function createDocs() {
  const auth = await authorize();
  // const drive = google.drive({
  //   version: "v3",
  //   auth
  // })
  const docs = google.docs({
    version: "v1",
    auth
  }).documents;


  //create
  try {
     await docs.create({
      "title": "My New Document",
    })

    // await docs.batchUpdate({
    //   auth,
    //   documentId: "1YirfIwiDApP-vFV7Du8CEEKV4UfL2-__2DHLRFM2Soc",
    //   requestBody: {
    //     requests: [
    //       {
    //         insertText: {
    //           location: {
    //             index: 1,
    //           },
    //           text: "hello!\n",
    //         },
    //       },
    //     ],
    //   },
    // });
    console.log("works!")
  } catch (err) {
    console.error(err)
  }
}


authorize().then(() => createDocs()).catch(console.error);

authorize().then(printDocTitle).catch(console.error);