import { useState } from 'react';
import { MetaWallet, MetaContract,useGetMetaWallet} from 'my-react-package';
import './App.css';
import { AbiItem } from 'my-react-package/lib/esm/types/MetaContractTypes';

const abi: Array<AbiItem> = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "executor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "onBehalfOf",
				"type": "address"
			}
		],
		"name": "MsgSender",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "execute",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

// const contractAddress = "0xaBE6F798CE83407BBf103e1C1454E1453b9C1148" Old gasless contract
const contractAddress = "0x810037e1E5d0cd94de87632c37Cdc97502731b28"; // With struct Signature

function App() {
	const [tx, setTx] = useState<string>();
	const {zeroWallet:new_wallet,isLoading} = useGetMetaWallet();

	const executeFunction = async function () {
		setTx("Creating a new wallet")
		
		console.log('sup', new_wallet, localStorage.getItem('webwalletPrivateKey'))
}

	return (
		<div className="App">
			<header className="App-header">
				<button className="execute-button" onClick={() => executeFunction()}>Create a transaction to execute</button>
				{/* <button onClick={() => handleExecuteFunction()}>Create a transaction to handleExecute</button> */}
				<a
					className="App-link"
					target="_blank"
					rel="noopener noreferrer"
				>
					{tx}
				</a>
			</header>
		</div>
	);
}

export default App;
