export class DonaterInfo
{
  constructor (publicKey, accountData) {
    this.publicKey = publicKey
    this.bump = accountData.bump
    this.author = accountData.authority
    this.donationSum = accountData.donationSum
  }

  get key () {
    return this.publicKey.toBase58()
  }
}