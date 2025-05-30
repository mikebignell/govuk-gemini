import { defineBackend, secret } from '@aws-amplify/backend';
import { data } from './data/resource';
import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { generatePage } from './function/generatePage/resource';

// Define the backend
const backend = defineBackend({
  auth,
  storage,
  generatePage,
  data
});
