import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('67fa7b4d00354918f84b');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = '68107e44000a5ab2cc85';
const COLLECTION_ID = '681209580029497a3c02';
const STORAGE_BUCKET_ID = '68107e5f001578ed6cc2';

export { client, account, databases, storage, ID, DATABASE_ID, COLLECTION_ID, STORAGE_BUCKET_ID, Query };