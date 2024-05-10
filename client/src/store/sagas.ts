import { takeEvery } from "redux-saga/effects";
import {
  JsonRpcProvider,
  Transaction,
  TransactionResponse,
  TransactionReceipt,
  TransactionRequest,
  BrowserProvider,
  Signer,
  // parseEther,
} from "ethers";

import apolloClient from "../apollo/client";
import { Actions, Action, TransactionAction } from "../types";
import { SaveTransaction } from "../queries";
import { navigate } from "../components/NaiveRouter";

function* sendTransaction(action: Action<TransactionAction>) {
  const provider = new JsonRpcProvider("http://localhost:8545");

  const walletProvider = new BrowserProvider(window.web3.currentProvider);

  const signer: Signer = yield walletProvider.getSigner();

  const accounts: Array<{ address: string }> = yield provider.listAccounts();

  const randomAddress = () => {
    const min = 1;
    const max = 19;
    const random = Math.round(Math.random() * (max - min) + min);
    return accounts[random].address;
  };

  const recipientAddress = () => {
    return accounts.find(account => account.address === action.payload?.recipient)?.address ?? randomAddress();
  };

  const transaction: TransactionRequest = {
    to: recipientAddress(),
    value: action.payload?.amount?.toString(),
  };

  try {
    const txResponse: TransactionResponse =
      yield signer.sendTransaction(transaction);
    console.log('i am here')
    const response: TransactionReceipt = yield txResponse.wait();

    console.log('i am here')

    const receipt: Transaction = yield response.getTransaction();

    const variables = {
      transaction: {
        gasLimit: (receipt.gasLimit && receipt.gasLimit.toString()) || "0",
        gasPrice: (receipt.gasPrice && receipt.gasPrice.toString()) || "0",
        to: receipt.to,
        from: receipt.from,
        value: (receipt.value && receipt.value.toString()) || "",
        data: receipt.data || null,
        chainId: (receipt.chainId && receipt.chainId.toString()) || "123456",
        hash: receipt.hash,
      },
    };

    yield apolloClient.mutate({
      mutation: SaveTransaction,
      variables,
    });

    yield navigate(`/transaction/${receipt.hash}`);
  } catch (error) {
    console.log(error)
    //
  }
}

export function* rootSaga() {
  yield takeEvery(Actions.SendTransaction, sendTransaction);
}
