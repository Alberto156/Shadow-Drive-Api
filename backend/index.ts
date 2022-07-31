//imports 
const nacl = require('tweetnacl')
import * as crypto2 from 'crypto'
import * as crypto from 'crypto-js';
import * as bs58 from 'bs58'
import *  as fetch from "cross-fetch";
import axios from 'axios'
const FormData = require("form-data");

import {
    PublicKey,
    Keypair,
} from '@solana/web3.js';
import fs from 'fs'
const SHDW_DRIVE_ENDPOINT = 'https://shadow-storage.genesysgo.net'

import * as path from "path";
const isLocal = "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

const SaveFileShadowDrive = async (fileUrl: any, fileName: any) => {
    let data;
    let store_account = new PublicKey("Address") // ask leonel for direction
    data = new FormData();

    const file = fs.readFileSync(fileUrl)

    /* 
        Ask angel how to get the key pair of an existing wallet without using the secret key
    */
    const keypair = Keypair.fromSecretKey(
        bs58.decode("Key Secret")
    );
    let owner_store_account = new PublicKey(keypair.publicKey)
    const _filename = fileName //crypto.SHA1(fileName).toString()
    const fileHashSum = crypto2.createHash("sha256");
    const fileNameHashSum = crypto2.createHash("sha256");
    fileHashSum.update(
        Buffer.isBuffer(file) ? file : Buffer.from(file)
    );
    fileNameHashSum.update(_filename);
    const fileNameHash = fileNameHashSum.digest("hex");

    let msg = `Shadow Drive Signed Message:\nStorage Account: ${store_account.toString()}\nUpload files with hash: ${fileNameHash}`;
    const encodedMessage = new TextEncoder().encode(msg);
    const signedMessage = nacl.sign.detached(encodedMessage, keypair.secretKey);
    const signature = bs58.encode(signedMessage)

    data.append("file", file, _filename);
    data.append("fileNames", _filename);
    data.append("message", signature.toString());
    data.append("storage_account", store_account.toString());
    data.append("signer", owner_store_account.toString());

    // console.log(`fileNames : ${_filename}`)
    // console.log(`message" : ${signature.toString()}`)
    // console.log(`storage_account : ${store_account.toString()}`)
    // console.log(`signer : ${owner_store_account.toString()}`)

    return axios
        .post(`${SHDW_DRIVE_ENDPOINT}/upload`, data)
        .then(function (response: any) {
            return {
                success: true,
                shadowUrl: response.data.finalized_locations[0]
            };
        })
        .catch(function (error: any) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
        });
}

const main = async () => {
    let size_collection = 4
    for (let i = 0; i < size_collection; i++) {
        //For images
        console.log("\n")
        const fileUrlImage = `${basePath}/assets/${i}.png`
        const response = await SaveFileShadowDrive(fileUrlImage.toString(), `${i}.png`)
        console.log(response)
        //For json
        const fileUrlJson = `${basePath}/assets/${i}.json`
        const response2 = await SaveFileShadowDrive(fileUrlJson.toString(), `${i}.json`)
        console.log(response2)
    }
}

main().then(() => {
    console.log("___main____")
})