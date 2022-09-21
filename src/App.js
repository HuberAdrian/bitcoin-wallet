import logo from './logo.svg';
import './App.css';
import React from 'react';
import { useState } from 'react';
import * as ecc from 'tiny-secp256k1'; // imported earlier version of tiny-secp256k1, version 1.1.6
import Dino_Game from './Dino_Game';


function App() {


    const bip39 = require('bip39')
    const bitcoin = require('bitcoinjs-lib')
    const { BIP32Factory } = require('bip32')
    // const ecc = require('tiny-secp256k1')
    console.log(ecc)
    
    //Define the network
    const network = bitcoin.networks.bitcoin //use networks.testnet for testnet

    const bip32 = BIP32Factory(ecc)


    // Derivation path
    const path = `m/44'/0'/0'/0`
    // Use m/44'/0'/0'/0 for mainnet
    // Use m/44'/1'/0'/0 for testnet

    // Generate a new seed
    let mnemonic = bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    let root = bip32.fromSeed(seed, network)

    let account = root.derivePath(path)
    let node = account.derive(0).derive(0)

    let btcAddress = bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: network,
    }).address

    console.log(`
    Wallet generated:
    - Address : ${btcAddress},
    - Key : ${node.toWIF()},
    - Mnemonic : ${mnemonic}
    `)


return (<>
    <h1>Test</h1>
    <h1> sdfjwesvk</h1>
    <Dino_Game />
</>)

}

export default App;