import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, push, update, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBU1YVA1bgSSlRhVGEs91_leMjSiT1YPcQ',
  authDomain: 'android-gym-56ceb.firebaseapp.com',
  databaseURL: 'https://android-gym-56ceb-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'android-gym-56ceb',
  storageBucket: 'android-gym-56ceb.firebasestorage.app',
  messagingSenderId: '419893996203',
  appId: '1:419893996203:web:9114c7e1879b4ce4c0a5ee',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, get, push, update, remove };
export default app;
