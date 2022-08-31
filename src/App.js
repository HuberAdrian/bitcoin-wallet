import logo from './logo.svg';
import './App.css';
import React from 'react';





function App() {
    const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')

//Define the network
const network = bitcoin.networks.bitcoin //use networks.testnet for testnet

// Derivation path
const path = `m/44'/1'/0'/0`
// Use m/44'/0'/0'/0 for mainnet

//added
const bip32 = BIP32Factory(ecc)


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
</>)

}

export default App;
