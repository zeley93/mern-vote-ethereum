
const db = require('../models');
const Web3 = require('web3');
const interfaceAbi = require('../contracts/Ballot.json');

exports.showPolls = async (req, res, next) => {
    try {
        const polls = await db.Poll.find()
            .populate('user', ['username', 'id']);

        res.status(200).json(polls);
    } catch (err) {
        err.status = 400;
        next(err);
    }
}

////// POLL FOR A SPECIFIC USERr

exports.usersPolls = async(req, res, next) => {
    try {
        const { id } = req.decoded;
        console.log(id);
        const user = await db.User.findById(id).populate('polls');
        res.status(200).json(user.polls);

    } catch(err) {
        err.status = 400;
        console.log("error users polls");
        return next({status: 400, message: err.message});
    }
}

////// POLL CREATE FUNCTION FOR MONGO

exports.createPoll = async (req, res, next) => {
    try {

        const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
        const { id } = req.decoded;
        console.log("id du user :", id);
        const user = await db.User.findById(id);
        const { question, options } = req.body;
        console.log("debut du déploiement de contrat + poll sur mongo db, args :", question, options);
        let listOpt = options.map(option => ({ option, votes: 0 }));
        let optTab = [];

        for(let i = 0; i < listOpt.length; i++){
            optTab[i] = web3.utils.asciiToHex(listOpt[i].option);
        }

        const Accounts = await web3.eth.getAccounts();
        let currentAccount = Accounts[0];

        if ( await web3.eth.personal.unlockAccount(currentAccount, '0x38bfe6f3f3d6c11c1c1fe248520f98d066520e08c83273180b53d4faa00adb5f', 600) ) {
            console.log(`${currentAccount} is unlocked`);
        }else{
            console.log(`unlock failed, ${currentAccount}`);
        }

        let myContract = await new web3.eth.Contract(interfaceAbi);
        myContract.options.data = '60806040523480156200001157600080fd5b50604051620010a4380380620010a4833981018060405260408110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856020820283011164010000000082111715620000d757600080fd5b5050929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001600260008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000018190555060008090505b8151811015620002145760036040518060400160405280848481518110620001b257fe5b60200260200101518152602001600081525090806001815401808255809150509060018203906000526020600020906002020160009091929091909150600082015181600001556020820151816001015550505080806001019150506200018e565b5062000226826200022e60201b60201c565b505062000353565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146200028857600080fd5b8060019080519060200190620002a0929190620002a4565b5050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620002e757805160ff191683800117855562000318565b8280016001018555821562000318579182015b8281111562000317578251825591602001919060010190620002fa565b5b5090506200032791906200032b565b5090565b6200035091905b808211156200034c57600081600090555060010162000332565b5090565b90565b610d4180620003636000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063609ff1bd11610066578063609ff1bd1461019d5780636a2275db146101bb5780639e7b8d611461023e578063a3ec138d14610282578063e2ba53f01461031f57610093565b80630121b93f146100985780632e4176cf146100c6578063409e2205146101105780635c19a95c14610159575b600080fd5b6100c4600480360360208110156100ae57600080fd5b810190808035906020019092919050505061033d565b005b6100ce6104da565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61013c6004803603602081101561012657600080fd5b81019080803590602001909291905050506104ff565b604051808381526020018281526020019250505060405180910390f35b61019b6004803603602081101561016f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610530565b005b6101a561094c565b6040518082815260200191505060405180910390f35b6101c36109c3565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102035780820151818401526020810190506101e8565b50505050905090810190601f1680156102305780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102806004803603602081101561025457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610a61565b005b6102c46004803603602081101561029857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610c63565b60405180858152602001841515151581526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200194505050505060405180910390f35b610327610cc0565b6040518082815260200191505060405180910390f35b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506000816000015414156103fb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f486173206e6f20726967687420746f20766f746500000000000000000000000081525060200191505060405180910390fd5b8060010160009054906101000a900460ff1615610480576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f416c726561647920766f7465642e00000000000000000000000000000000000081525060200191505060405180910390fd5b60018160010160006101000a81548160ff0219169083151502179055508181600201819055508060000154600383815481106104b857fe5b9060005260206000209060020201600101600082825401925050819055505050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6003818154811061050c57fe5b90600052602060002090600202016000915090508060000154908060010154905082565b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060010160009054906101000a900460ff16156105f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f596f7520616c726561647920766f7465642e000000000000000000000000000081525060200191505060405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561069a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f53656c662d64656c65676174696f6e20697320646973616c6c6f7765642e000081525060200191505060405180910390fd5b5b600073ffffffffffffffffffffffffffffffffffffffff16600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461083d57600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691503373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610838576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f466f756e64206c6f6f7020696e2064656c65676174696f6e2e0000000000000081525060200191505060405180910390fd5b61069b565b60018160010160006101000a81548160ff021916908315150217905550818160010160016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060010160009054906101000a900460ff1615610930578160000154600382600201548154811061090d57fe5b906000526020600020906002020160010160008282540192505081905550610947565b816000015481600001600082825401925050819055505b505050565b6000806000905060008090505b6003805490508110156109be57816003828154811061097457fe5b90600052602060002090600202016001015411156109b1576003818154811061099957fe5b90600052602060002090600202016001015491508092505b8080600101915050610959565b505090565b60018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a595780601f10610a2e57610100808354040283529160200191610a59565b820191906000526020600020905b815481529060010190602001808311610a3c57829003601f168201915b505050505081565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610b06576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180610cee6028913960400191505060405180910390fd5b600260008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff1615610bc9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f54686520766f74657220616c726561647920766f7465642e000000000000000081525060200191505060405180910390fd5b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015414610c1857600080fd5b6001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000018190555050565b60026020528060005260406000206000915090508060000154908060010160009054906101000a900460ff16908060010160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060020154905084565b60006003610ccc61094c565b81548110610cd657fe5b90600052602060002090600202016000015490509056fe4f6e6c79206368616972706572736f6e2063616e206769766520726967687420746f20766f74652ea165627a7a723058201cc5def8daea8b6482105f98a9a77606e4df746a2cce70fd776275a7aa10015d0029';
        
        await myContract.deploy({
            arguments: [req.body.question, optTab]
        })
        .send({
            from: currentAccount,
            gas: 150000000
        }, (error, transactionHash) => {   
                })
        .on('error', (error) => {
            console.log(".ON ERROR", error); 
            next(error);
        })
        .on('transactionHash', (transactionHash) => {
            console.log(".ON TRANSACTION HASH nothing done here");
        })
        .on('receipt', (receipt) => {
            console.log(".ON RECEIPT new Address should be retrieved here");
            console.log(receipt.contractAddress); // contains the new contract address
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log(".ON confNumber");
            console.log(confirmationNumber);
        })
        .then((newContractInstance) => {
            console.log(newContractInstance.options.address); // instance with the new contract address
            console.log("CONTRAT INSTANCIE A L ADRESSE CI DESSUS");
            console.log("fin du délire");
            setTimeout(async () => {
                const poll = await db.Poll.create({
                    question,
                    user,
                    options: options.map(option => ({ option, votes: 0 })),
                    contractAddress: newContractInstance.options.address,
                    chairpersonAdress: currentAccount
                });
                user.polls.push(poll._id);
                await user.save();
            }, 5000);
            res.status(201).json({...poll._doc, user: user._id});
        });
    } catch (err) {
        next(err);
    }
}


exports.getPoll = async (req, res, next) => {

    try {

        const {id} = req.params;
        console.log(id);
        const poll = await db.Poll.findById(id).populate('user', ['username', 'id']);
        console.log(poll);
        
        if(!poll) throw new Error('No poll found');
        res.status(200).json(poll);

    } catch (err) {
        err.status = 400;
        next(err);
    }
}

exports.deletePoll = async (req, res, next) => {
    try {
        const {id: pollId} = req.params;
        const {id: userId} = req.decoded;
        const poll = await db.Poll.findById(pollId);

        if(!poll) throw new Error('No poll found');

        if(poll.user.toString() !== userId) {
            throw new Error('Unauthorized access');
        }

        await poll.remove();
        res.status(200).json(poll);
        
    } catch (err) {
        err.status = 400;
        next(err);
    }
}

exports.vote = async (req, res, next) => {
    try {

        const {id: pollId} = req.params;
        const {id: userId} = req.decoded;
        const {answer} = req.body;

        if(answer) {

            const poll = await db.Poll.findById(pollId);
            if(!poll) throw new Error('No poll found'); 

            const vote = poll.options.map(
                option => {
                    if(option.option == answer) {
                        return {
                            option: option.option,
                            id: option._id,
                            votes: option.votes + 1
                        };
                    } else {
                        return option;
                    }
                }
            );

            if(poll.voted.filter(user => user.toString() === userId).length <= 0) {
                    poll.voted.push(userId);
                    poll.options = vote;
                    await poll.save();
                    res.status(202).json(poll);
                } else {
                    throw new Error('Already voted');
                }
        } else {
            throw new Error('No answer');
        }
    } catch(err) {
        err.status = 400;
        next(err);
    }
}