import { Button, Row, Col, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import petImage from '../cute-pet.png';
import './ExampleUI.css';
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

import { Address, Balance, Events } from "../components";

export default function ExampleUI({
  countPetStrokes,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  return (
    <div style={{ fontFamily: 'Arial', fontSize: '200%' }}>
      <div style={{ margin: 8 }}>
        <Button
          className="mainButton"
          style={{
            margin: 20,
            paddingBottom: '10px',
            fontSize: '120%',
            width: '900px',
            height: '80px',
            borderRadius: '30px',
            borderWidth: '4px',
            borderColor: '#2266FF',
            background: '#CCFFAA',
            color: '#008800'
          }}
          onClick={async () => {
            /* look how you call strokeThePet on your contract:*/
            /* notice how you pass a call back for tx updates too */
            const result = tx(writeContracts.DemoPetStroker.strokeThePet(), update => {
              console.log("📡 Transaction Update:", update);
              if (update && (update.status === "confirmed" || update.status === 1)) {
                console.log(" 🍾 Transaction " + update.hash + " finished!");
                console.log(
                  " ⛽️ " +
                    update.gasUsed +
                    "/" +
                    (update.gasLimit || update.gas) +
                    " @ " +
                    parseFloat(update.gasPrice) / 1000000000 +
                    " gwei",
                );
              }
            });
            console.log("awaiting metamask/web3 confirm result....", result);
            console.log(await result);
          }}
        >
          Press this button to stroke pet using Metamask Snaps
        </Button>
      </div>
      <img src={petImage} alt="Cute Pet" style={{ margin: '10px' }} />
      <p style={{ color: 'darkgreen' }}>Pet has been stroked {countPetStrokes} times</p>
      <p style={{ color: 'grey' }}>Is this too smooth? Try using the <a href="https://stroke-the-pet-painfully.surge.sh/"><u>painful version</u></a> with Metamask pop-ups</p>
      <div style={{ color: '#BB8800', fontSize: '65%' }}>
        <div style={{ }}>
          <p>&nbsp;</p>
          <p><b>Instructions</b></p>
          <p><i>tl;dr – get Metamask on Optimistic Goerli network, and have some OptGoerliETH</i></p>
          <p><b>Full steps:</b></p>
          <p>To run the snaps, currently (Nov 2022) they must be run in the terminal locally</p>
          <p>Log in to Metamask, change network to Goerli testnet</p>
          <p>If you need Goerli ETH, use the faucet <a href="https://goerlifaucet.com/" target="_blank"><u>here</u></a></p>
          <p>Bridge Goerli ETH to Optimistic Goerli <a href="https://app.optimism.io/bridge/deposit" target="_blank"><u>here</u></a></p>
          <p>Add the Optimistic Goerli network to Metamask using <a href="https://chainlist.org/chain/420" target="_blank"><u>Chainlist</u></a></p>
          <p>Inspect the `stroke pet` <a href="https://blockscout.com/optimism/goerli/address/0xECf7D972D829eF1b5c9875b1aceb0D442946BD2b/contracts#address-tabs" target="_blank"><u>Contract</u></a> and <a href="https://github.com/AlexCheema/auto-tx" target="_blank"><u>GitHub repo</u></a></p>
          <p>&nbsp;</p>
        </div>
      </div>
      <div style={{ margin: '500px', color: 'rgba(255,0,0,0.6)', fontSize: '45%' }}>
        graphic design proudly presented by drcoder.eth
      </div>
    </div>
  );
}
