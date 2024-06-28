import {initializeApp} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getStorage } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyANo22SRYx2Icux7NRE_AX3cOByIKCgTwk",
    authDomain: "bitirmeproje-ad56d.firebaseapp.com",
    projectId: "bitirmeproje-ad56d",
    storageBucket: "bitirmeproje-ad56d.appspot.com",
    messagingSenderId: "129861234415",
    appId: "1:129861234415:web:3da3ab2d890f919721351a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
if (typeof window !== 'undefined') {
    // Enable debug mode for Firebase App Check
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}


// Initialize Firebase App Check with reCAPTCHA v3
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Le9ov8pAAAAAOKU2Jel6JvYF6zjGN10CDBcvmvn')});

export { auth, db, appCheck,storage };
