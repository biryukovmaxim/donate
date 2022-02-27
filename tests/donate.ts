import * as anchor from '@project-serum/anchor';
import {
  Program
} from '@project-serum/anchor';
import {
  Donate
} from '../target/types/donate';
import * as assert from "assert";
const {
  SystemProgram
} = anchor.web3;

describe('donation positive tests', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.Donate as Program < Donate > ;
  let ownerPda: anchor.web3.Keypair;
  let balance: number;

  it('init', async () => {
    ownerPda = anchor.web3.Keypair.generate();
    const tx = await program.rpc.initialize({
      accounts: {
        donationReceiver: ownerPda.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [ownerPda]
    });
    balance = await provider.connection.getBalance(ownerPda.publicKey);
    console.log("Initialize tx signature", tx);
  });

  let donater:  anchor.web3.Keypair;
  let donaterAccount: anchor.web3.PublicKey;
  let bump: number;
  const firstDonate = new anchor.BN(500000);
  const secondDonate = new anchor.BN(700000);
  it('first donate', async () => {
    donater = anchor.web3.Keypair.generate();
    const airdropSignature = await provider.connection.requestAirdrop(
        donater.publicKey,
        anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSignature);

    [donaterAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
        // @ts-ignore
        ['donate', donater.publicKey.toBytes()],
        program.programId
    );
    const tx = await program.rpc.donate(firstDonate, bump, {
      accounts: {
        donaterAccount: donaterAccount,
        donater: donater.publicKey,
        receiver: ownerPda.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [donater]
    })
    await provider.connection.confirmTransaction(tx);
    const data = await program.account.donaterAccount.fetch(donaterAccount)
    assert.equal(data.donationSum.toNumber(),firstDonate)
    const newBalance = await provider.connection.getBalance(ownerPda.publicKey);
    assert.equal(newBalance, balance + firstDonate.toNumber())
    balance = newBalance;
  })
  it('second donate', async () => {
    const tx = await program.rpc.donate(secondDonate, bump, {
      accounts: {
        donaterAccount: donaterAccount,
        donater: donater.publicKey,
        receiver: ownerPda.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [donater],
    })
    await provider.connection.confirmTransaction(tx);

    const data = await program.account.donaterAccount.fetch(donaterAccount)
    console.log(data.donationSum.toNumber());
    assert.equal(firstDonate.add(secondDonate), data.donationSum.toNumber())
    const newBalance = await provider.connection.getBalance(ownerPda.publicKey);
    assert.equal(newBalance, balance + secondDonate.toNumber())
    balance = newBalance;
  })
  it('another donate', async () => {
    donater = anchor.web3.Keypair.generate();
    const airdropSignature = await provider.connection.requestAirdrop(
      donater.publicKey,
      anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSignature);

    [donaterAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
      // @ts-ignore
      ['donate', donater.publicKey.toBytes()],
      program.programId
    );
    const tx = await program.rpc.donate(firstDonate, bump, {
      accounts: {
        donaterAccount: donaterAccount,
        donater: donater.publicKey,
        receiver: ownerPda.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [donater]
    })
    await provider.connection.confirmTransaction(tx);
    const data = await program.account.donaterAccount.fetch(donaterAccount)
    assert.equal(data.donationSum.toNumber(),firstDonate)
    const newBalance = await provider.connection.getBalance(ownerPda.publicKey);
    assert.equal(newBalance, balance + firstDonate.toNumber())
    balance = newBalance;

    const donaters = await program.account.donaterAccount.all()
    assert.equal(donaters.length, 2)
    console.log(donaters)
  })
  it('double init', async () => {
    let e: any
    try {
      await program.rpc.initialize({
        accounts: {
          donationReceiver: ownerPda.publicKey,
          owner: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [ownerPda]
      });
    } catch (innerE: any) {
      e = innerE;
    } finally {
      assert.notEqual(e, undefined)
    }
    try {
      ownerPda = anchor.web3.Keypair.generate();
     await program.rpc.initialize({
        accounts: {
          donationReceiver: ownerPda.publicKey,
          owner: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [ownerPda]
      });
    } catch (innerE: any) {
      e = innerE;
    } finally {
      assert.notEqual(e, undefined)
    }
  });
  it('withdraw', async () => {
    const pdaBalanceOld = await provider.connection.getBalance(ownerPda.publicKey);
    console.log("before withdraw donation acc balance", pdaBalanceOld);
    const externalBalanceOld = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("before withdraw external acc balance", externalBalanceOld);

    const tx = await program.rpc.withdraw({
      accounts: {
        donationReceiverData: ownerPda.publicKey,
        payer: ownerPda.publicKey,
        destination: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
       signers: [ownerPda]
    });
    await provider.connection.confirmTransaction(tx);

    const pdaBalanceNew = await provider.connection.getBalance(ownerPda.publicKey);
    console.log("after withdraw donation acc balance", pdaBalanceNew);
    const externalBalanceNew = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("after withdraw external acc balance", externalBalanceNew);
    //11000 +- gas
    assert.ok(externalBalanceNew >= pdaBalanceOld + externalBalanceOld- 11000)
    assert.equal(pdaBalanceNew, 0)
  });
});