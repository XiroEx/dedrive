import React, { useRef, useState, useEffect } from "react";
import { getFirestore, doc } from 'firebase/firestore';
import { useDocument, useDocumentData } from 'react-firebase-hooks/firestore';
import * as IPFS from "ipfs-core";
import { decryptVideo } from "../functions/encryption";

export default function VideoList({db, user, setCidData, ipfs, keys}) {

    const [value, loading, error, snapshot] = useDocumentData(doc(db, `users/${user.uid}`));

    const loadVideo = async (cid) => {
        const chunks = []
        for await (const chunk of ipfs.cat(cid)) {
          chunks.push(chunk)
        }
        const decrytped = await decrypt(chunks)
        const blob = new Blob(chunks, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        console.log(url)
        setCidData(url)
    }
    

    const decrypt = async (encrypted) => {
        let decrypted = await decryptVideo(encrypted, keys.privateKey)
        return decrypted
    }

    return (
        <>{ value && value.videos.map((cid) => {
            return <div key={cid} onClick={()=>loadVideo(cid)}>{cid}</div>
        }) }</>
    )
}