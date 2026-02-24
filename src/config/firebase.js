import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, push, update, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCId5RybPNS7EJbBdSr0F93CzQ5F-quEK0',
  projectId: 'sg-fitness-new',
  databaseURL: 'https://sg-fitness-new-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, get, push, update, remove };
export default app;
