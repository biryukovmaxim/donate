export class DonationReceiver
{
  constructor (pdaAccount, accountData) {
    this.pdaAccount = pdaAccount
    this.publicKey = pdaAccount.publicKey
    this.owner = accountData.owner
  }

  get key () {
    return this.pdaAccount.publicKey.toBase58()
  }
}