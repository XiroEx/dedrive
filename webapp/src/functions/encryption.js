export const generateKeys = async () => {
    const keys = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: { name: "SHA-256" },
        },
        true,
        ["encrypt", "decrypt"]
      );
    return (keys)
};

 // Function to encrypt video data
 export const encryptVideo = async (videoData, publicKey) => { 
    try {
        const encodedVideoData = new Uint8Array(videoData)
        const encryptedData = await window.crypto.subtle.encrypt(
          {
              name: "RSA-OAEP",
          },
          publicKey,
          encodedVideoData
        )
        console.log('done2')
        const encryptedDataArray = new Blob([encryptedData], { type: 'video/mp4' })
        return (encryptedDataArray)
    } catch (error) {
        console.error(error)
    }
  }

  // Function to decrypt video data
  export const decryptVideo = async (encryptedData, privateKey) => {
    try {
        const encryptedDataBuffer = new Uint8Array(encryptedData)
        const decryptedData = await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
          },
          privateKey,
          encryptedData
        )
        const decryptedVideoData = new Blob([decryptedData], { type: 'video/mp4' })
        return (decryptedVideoData)
    } catch (error) {
        console.error(error)
    }
  }