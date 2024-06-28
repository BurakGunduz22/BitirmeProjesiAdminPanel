import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {initializeAppCheck, ReCaptchaV3Provider} from 'firebase/app-check';
import {getStorage} from "firebase/storage";

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


// Initialize Firebase App Check with reCAPTCHA v3
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Le8ov8pAAAAAMp6F4KxalM5tSJtjGunjY1dR3q6'),
    isTokenAutoRefreshEnabled: true
});

export {auth, db, appCheck, storage};
