import CryptoJS from 'crypto-js';

const SECRET_KEY = 'residente-secure-key-v1'; // En producción, usar variable de entorno

export const secureStorage = {
    setItem: (key, value) => {
        try {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
            localStorage.setItem(key, encrypted);
        } catch (e) {
            console.error("Error encrypting data", e);
        }
    },
    getItem: (key) => {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData;
        } catch (e) {
            // Si falla la desencriptación (por ejemplo, datos viejos no encriptados), 
            // intentamos devolver null o limpiar
            console.warn("Error decrypting data, clearing item", e);
            localStorage.removeItem(key);
            return null;
        }
    },
    removeItem: (key) => {
        localStorage.removeItem(key);
    }
};
