import React, { useRef, useState, useEffect } from "react";
import { Buffer } from 'buffer';
import { doc, updateDoc, arrayUnion, } from "firebase/firestore";
import { decryptVideo, encryptVideo } from "../functions/encryption";

export default function VideoRecorder({ipfs, cid, setCid, recording, setRecording, 
  recordedData, setRecordedData, uploading, setUploading, db, user, cidData, setCidData, keys, }) {
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  useEffect(()=>{
    if (videoRef.current)
      videoRef.current.srcObject = stream
  },[recording])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    setStream(stream)
    const recorder = new MediaRecorder(stream)

    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop())
      const blob = new Blob(chunks, { type: "video/mp4" })
      setRecordedData(blob)
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false)
    setStream(null)
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
    videoRef.current.srcObject = null
  };

  const handleSave = async () => {
    setUploading(true)
    const data = await encrypt(recordedData)
    const file = new File([recordedData], `${Date.now()}.mp4`, { type: 'video/mp4' })
    let CID

    try {
        const results = await ipfs.add(file, { pin:true, progress: (prog) => console.log(`upload progress: ${prog}`) })
        setCid(results.cid.toString())
        CID = results.cid.toString()
    } catch (error) {
        console.error(error)
    } finally {
        setUploading(false)
        console.log(user.uid)
        const docRef = doc(db, `/users/${user.uid}`)
        await updateDoc(docRef, {
            videos: arrayUnion(CID)
        })
    }
  };

  const handleClear = () => {
    setRecordedData(null)
    setCidData(null)
    setCid(null)
  };

  
  const encrypt = async (data) => {
    let encrypted = await encryptVideo('WEEEEE', keys.publicKey)
    return encrypted
  }

  const idle = !recordedData && !uploading && !recording && !cidData
  const srcData = recordedData ? URL.createObjectURL(recordedData) : recordedData

  //<a href={`https://ipfs.filebase.io/ipfs/${cid}`} target="_blank">{`---->Video saved to IPFS!<----`}</a><br/>

  return (
    <div>
      {((recordedData || recording) && !cidData) && <video ref={videoRef} src={srcData} autoPlay={recording} controls={!recording} muted={recording} style={idle ? {display:'none'}:{ width: "100%", height: "400px" }}></video>}
      {cidData && <video src={cidData} autoPlay/>}
      {}
      {cid ? (
        <div>
          {uploading ? (
            <div>Uploading video to IPFS... ({cid})</div>
          ) : (
            <div>
              <button onClick={handleClear}>Clear</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {recording && <button onClick={stopRecording}>Stop</button>}
          {idle && <button onClick={startRecording}>Record</button>}
          {cidData && <button onClick={handleClear}>Clear</button>}
          {recordedData && !uploading && <>
            <button onClick={handleClear} style={{marginRight:5}}>Clear</button>
            <button onClick={handleSave}>Save to IPFS</button>
          </>}
        </div>
      )}
    </div>
  );
};
