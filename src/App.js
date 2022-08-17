import logo from './logo.svg';
import './App.css';
import React from 'react';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';





function App() {

  let bip32 = BIP32Factory(ecc);
  let node = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
  let child = node.derivePath('m/0/0');

return (<>
<h1>Test</h1>
</>)

}

export default App;
