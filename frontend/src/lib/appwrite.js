import { Client, Storage, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('69cbbf3700296d136aac');             // Your project ID

export const storage = new Storage(client);
export { ID };
