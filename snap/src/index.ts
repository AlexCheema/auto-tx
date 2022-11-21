import { OnRpcRequestHandler } from '@metamask/snap-types';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx'
import { Chain, Common, Hardfork } from '@ethereumjs/common'
import { ethers } from 'ethers';
const provider = new ethers.providers.Web3Provider(wallet);

const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })

export async function getAccount(request) {
  const privateKey = await wallet.request({
    method: 'snap_getAppKey',
  });
  const ethWallet = new ethers.Wallet(privateKey, provider);
  return { publicKey: ethWallet.address };
}

async function checkPermissions(txData) {
  const permissions = await getPermissions();

  const allowedTo = permissions?.allowedTo ?? ["0xecf7d972d829ef1b5c9875b1aceb0d442946bd2b"];

  if (!txData.to || !allowedTo.map(a => a.toLowerCase()).includes(txData.to.toLowerCase())) {
    return false;
  }

  return true;
}

export async function permissionedSign(request) {
  const { txData } = request.params;

  if (!txData || !(await checkPermissions(txData))) {
    throw new Error("transaction failed permissions check");
  }

  const privateKey = await wallet.request({
    method: 'snap_getAppKey',
  });

  const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
  const signedTx = tx.sign(Buffer.from(privateKey, 'hex'));

  return { tx: JSON.stringify(tx), signedTx: ethers.utils.hexlify(signedTx.serialize()) };
}

export function isPermissions(o) {
  return o && typeof o === "object";
}

export async function setPermissions(request) {
  const { permissions } = request.params;

  if (!isPermissions(permissions)) {
    throw new Error("invalid permissions");
  }

  const confirmed = await wallet.request({
    method: 'snap_confirm',
    params: [
      {
        prompt: "Approve permissions?",
        description:
          "Do you want to approve the following permissions?",
        textAreaContent:
           `
           Permissions: ${JSON.stringify(permissions)}
           `,
      },
    ],
  });

  if (!confirmed) {
    throw new Error("permissions rejected");
  }
  
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { permissions }],
  });

  return { confirmed };
}

export async function getPermissions(request) {
  const { permissions } = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  if (!permissions) {
    return undefined;
  }
  if (!isPermissions(permissions)) {
    throw new Error("corrupt permissions in storage");
  }
  return permissions;
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
    switch (request.method) {
    case 'getAccount':
      return await getAccount(request);
    case 'permissionedSign':
      return await permissionedSign(request);
    case 'setPermissions':
      return await setPermissions(request);
    case 'getPermissions':
      return { permissions: await getPermissions(request) };
    default:
      throw new Error('Method not found.');
  }
};

