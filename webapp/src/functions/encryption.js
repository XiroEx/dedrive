export const generateKeys = async () => {
    const keys = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
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
        const encodedVideoData = new TextEncoder().encode(videoData)
        const encryptedDataBuffer = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        encodedVideoData
        );
        const encryptedDataArray = Array.from(new Uint8Array(encryptedDataBuffer))
        return (encryptedDataArray)
    } catch (error) {
        console.error(error)
    }
  };

  // Function to decrypt video data
  export const decryptVideo = async (encryptedData, privateKey) => {
    try {
        const encryptedDataBuffer = new Uint8Array(encryptedData).buffer
        const decryptedDataBuffer = await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
          },
          privateKey,
          encryptedDataBuffer
        );
        const decryptedVideoData = new TextDecoder().decode(decryptedDataBuffer)
        return (decryptedVideoData)
    } catch (error) {
        console.error(error)
    }
  };