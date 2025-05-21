import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { generatePage } from './function/generatePage/resource';

defineBackend({
  auth,
  storage,
  generatePage
});