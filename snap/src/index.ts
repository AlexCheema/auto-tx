import { OnRpcRequestHandler } from '@metamask/snap-types';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { Address, Transaction } from './micro-eth-signer';

export async function getAddress(request) {
  const privateKey = await wallet.request({
    method: 'snap_getAppKey',
  });
  return Address.fromPrivateKey(privateKey);
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

  const tx = new Transaction(txData);
  const signedTx = await tx.sign(privateKey);

  return { tx: JSON.stringify(tx), signedTx: signedTx.hex };
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
  try {
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
  } catch (err) {
    return undefined;
  }
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
    case 'getAddress':
      return { address: await getAddress(request) };
    case 'permissionedSign':
      return await permissionedSign(request);
    case 'setPermissions':
      return await setPermissions(request);
    case 'getPermissions':
      const permissions = await getPermissions(request);
      if (!permissions) return { permissionsSet: false };
      return { permissionsSet: true, permissions };
    default:
      throw new Error('Method not found.');
  }
};
