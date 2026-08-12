import crypto from "crypto";
import fs from "fs";

//generating private and public key for jwt RS256 method using node code mobules
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

console.log("Public Key", publicKey);
console.log("Private key", privateKey);

fs.writeFileSync("certs/private.pem", privateKey);
fs.writeFileSync("certs/public.pem", publicKey);
