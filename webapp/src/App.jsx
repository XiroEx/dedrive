import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import VideoRecorder from './components/recorder'
import { GoogleAuthProvider, signInWithRedirect, getAuth, signOut } from "firebase/auth";
import { initializeApp} from "firebase/app";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirestore } from "firebase/firestore";
import * as IPFS from "ipfs-core";

import './App.css'
import VideoList from './components/video-list';
import { decryptVideo, encryptVideo, generateKeys } from './functions/encryption';

const provider = new GoogleAuthProvider();
initializeApp({
  apiKey: "AIzaSyA13K32kl6ooqWYBqbVRC9vh1WJwRVl9CM",
  authDomain: "dedrive-0420.firebaseapp.com",
  projectId: "dedrive-0420",
  storageBucket: "dedrive-0420.appspot.com",
  messagingSenderId: "1047672632983",
  appId: "1:1047672632983:web:341853d5764441f8341bd2",
  measurementId: "G-KC43KCMNQF"
})
const auth = getAuth();
const db = getFirestore();

function App() {
  const [ipfs, setIPFS] = useState(null);
  const [cid, setCid] = useState(null);
  const [keys, setKeys] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordedData, setRecordedData] = useState(null);
  const [cidData, setCidData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, loading, error] = useAuthState(auth);

  const videoProps = {cid, setCid, setCidData, recording, setRecording, cidData, ipfs,
    uploading, setUploading, recordedData, setRecordedData, db, user}

  useEffect(()=> {
    async function go() {
      if (!ipfs) {
        let _ipfs = await IPFS.create({
          url: 'http://home.georgeanthony.net:8080'
        })
        setIPFS(_ipfs)
      }
    }
    go()
  },[])

  const login = () => {
    signInWithRedirect(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }

  const logout = () => {
    signOut(auth)
  }
  
  const genKeys = async () => {
    let _keys = await generateKeys()
    setKeys(_keys)
    saveKeys(_keys)
  }

  const encrypt = async (data) => {
    let encrypted = await encryptVideo('WEEEEE', keys.publicKey)
    console.log(encrypted)
  }

  const decrypt = async (encrypted) => {
    let decrypted = await decryptVideo(encrypted, keys.privateKey)
    console.log(decrypted)
  }
  
  const saveKeys = (keys) => {
    window.crypto.subtle.exportKey("jwk", keys.publicKey)
    .then(e=>localStorage.setItem("publicKey",JSON.stringify(e)))
    window.crypto.subtle.exportKey("jwk", keys.privateKey)
    .then(e=>localStorage.setItem("privateKey",JSON.stringify(e)))
  }

  const loadKey = async () => {
    const options = { name: "RSA-OAEP", hash: {name: "SHA-256"}, }
    const publicKey = await window.crypto.subtle.importKey("jwk", JSON.parse(localStorage.getItem("publicKey")),
      options, false, ["encrypt"])
    const privateKey = await window.crypto.subtle.importKey("jwk", JSON.parse(localStorage.getItem("privateKey")),
      options, false, ["decrypt"])
    return {publicKey, privateKey}
  }

  const idle = !recordedData && !uploading && !recording && !cidData 
  const keyed = user && keys
  
  return (
    <div className="App">
      <h1>deDrive</h1><br/>
      {!user && !loading && !error && <button onClick={login}>Login</button>}
      {keyed && <VideoRecorder {...videoProps}/>}<br/>
      {keyed && <VideoList {...{db, user, setCidData, ipfs}} />}<br/>
      {user && !keys &&<><button onClick={genKeys}>Generate Keys</button><br/><br/></>}
      {keyed && <h3>keys are generated and stored</h3>}
      {user && idle && <button onClick={logout}>Logout</button>}
    </div>
  )
}

export default App
