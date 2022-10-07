
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log("New wallet address " + new_wallet.address)

		setTx("Attaching 'questbook' relayer to the wallet")

		new_wallet.attachGasStation('questbook',
			'https://vq7xis18f6.execute-api.ap-south-1.amazonaws.com/v0/transaction');

		new_wallet.attachGasStation('questbook_local',
			'http://localhost:3001/v0/transaction');

		await new Promise(resolve => setTimeout(resolve, 1000));

		let contract = new MetaContract();

		// contract.polygon(abi, contractAddress)
		contract.ethereum(abi, contractAddress);

		let contractWithWallet = contract.attach(new_wallet);

		setTx("Submitting gasless transaction ...");
		let response = await contractWithWallet
			.on("ethereum")
			.to("questbook_local")
			.execute(contractAddress, 9);

		await new Promise(resolve => setTimeout(resolve, 1000));

		setTx("Created Tx on chain : " + response.data.hash);
	}

	const handleExecuteFunction = async function () {
		setTx("Creating a new wallet")

		let new_wallet = new MetaWallet();

		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log("New wallet address " + new_wallet.address)

		setTx("Attaching 'questbook' relayer to the wallet")

		new_wallet.attachGasStation('questbook', 'http://localhost:3001/')

		await new Promise(resolve => setTimeout(resolve, 1000));

		let contract = new MetaContract();

		contract.polygon(abi, contractAddress)

		let contractWithWallet = contract.attach(new_wallet);

		setTx("Submitting gasless transaction ...")
		let response = await contractWithWallet
			.on("polygon")
			.to("questbook")
			.handleExecute(new_wallet.address, contractAddress, 10, 21000);

		await new Promise(resolve => setTimeout(resolve, 1000));

		setTx("Created Tx on chain : " + response.data.txHash);
	