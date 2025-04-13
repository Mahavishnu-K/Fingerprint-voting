import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('67fa7b4d00354918f84b');

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };