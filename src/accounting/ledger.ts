import { randomUUID, UUID } from 'crypto'
import { Money } from './money'
import type { Account, AccountName } from './account'

export class Line {
  protected constructor(
    public accountId: UUID,
    public type: 'debit' | 'credit',
    public amount: Money,
  ) {}

  static create(account: Account, amount: Money, type: 'debit' | 'credit') {
    if (amount.isZero()) return new Error('Amount cannot be 0')
    return new Line(account.id, type, amount)
  }

  hasSameAccount(other: Line) {
    return this.accountId === other.accountId
  }

  hasSameAmount(other: Line) {
    return this.amount.isEqual(other.amount)
  }

  hasSameType(other: Line) {
    return this.type === other.type
  }

  isEqual(other: Line) {
    return this.hasSameAccount(other) && this.hasSameAmount(other) && this.hasSameType(other)
  }

  isSameDirection(other: Line) {
    return this.hasSameAccount(other) && this.hasSameType(other)
  }

  isReverseDirection(other: Line) {
    return this.hasSameAccount(other) && !this.hasSameType(other)
  }
}

export type Description = string

export class JournalEntry {
  protected constructor(
    public description: Description,
    public date: Date,
    public lines: Line[],
    public trxId: UUID | null = null,
    public id: UUID = randomUUID(),
  ) {}
  static create(description: Description, date: Date, lines: Line[], trxId?: UUID) {
    if (description.length === 0) return new Error('Description cannot be empty')
    if (date.getTime() > Date.now()) return new Error('Date cannot be in the future')
    if (lines.length === 0) return new Error('Journal Entry lines cannot be empty')

    const hasSameAccount = lines.filter((entry) => lines.some((e) => e.hasSameAccount(entry)))
    if (hasSameAccount.length > 0)
      return new Error('You cannot have multiple journal entry lines for the same account')

    const trx = new JournalEntry(description, date, lines, trxId)
    if (!trx.isBalanced()) return new Error('Journal Entry is not balanced')
    return trx
  }

  totalDebit() {
    return this.lines
      .filter((entry) => entry.type === 'debit')
      .reduce((acc, entry) => acc.sum(entry.amount), new Money(0, 0))
  }

  totalCredit() {
    return this.lines
      .filter((entry) => entry.type === 'credit')
      .reduce((acc, entry) => acc.sum(entry.amount), new Money(0, 0))
  }

  isBalanced() {
    return this.totalDebit().isEqual(this.totalCredit())
  }

  get amount() {
    return this.totalDebit();
  }

  get accounts() {
    return this.lines.map((line) => line.accountId)
  }
}

export class ChartOfAccounts {
  constructor(public accounts: Account[]) {}

  public addAccount(account: Account) {
    if (this.hasAccountWithId(account.id)) return new Error(`Account ${account.id} already exists`)
    if (this.hasAccountWithName(account.name)) return new Error(`Account ${account.name} already exists`)
    this.accounts.push(account)
    return true
  }

  public hasAccountWithId(accountId: UUID) {
    return this.accounts.some((account) => account.id === accountId)
  }

  public hasAccountWithName(accountName: AccountName) {
    return this.accounts.some((account) => account.name === accountName)
  }

  public getAccountById(accountId: UUID) {
    return this.accounts.find((account) => account.id === accountId) ?? new Error(`Account ${accountId} not found`)
  }

  public getAccountByName(accountName: AccountName) {
    return (
      this.accounts.find((account) => account.name === accountName) ?? new Error(`Account ${accountName} not found`)
    )
  }
}



export class Ledger {
    constructor(
      public accounts: ChartOfAccounts,
      public entries: JournalEntry[],
    ) {}

  static fromModel(model: LedgerModel) {

  public addEntry(entry: JournalEntry) {
    if (entry.accounts.some((account) => !this.accounts.hasAccountWithId(account))) return new Error('Account not found')
    if (!entry.isBalanced()) return new Error('Journal Entry is not balanced')
    this.entries.push(entry)
    return true
  }

  getEntriesByAccount(accountId: UUID) {
    return this.entries.filter((entry) => entry.accounts.includes(accountId))
  }

  getLinesByAccount(accountId: UUID) {
    return this.entries.flatMap((entry) => entry.lines).filter((line) => line.accountId === accountId)
  }

  getBalance(accountId: UUID) {
    if (!this.accounts.hasAccountWithId(accountId)) return new Error('Account not found');
    const lines = this.getLinesByAccount(accountId);
    return lines.reduce((acc, line) => {
      if (line.type === 'debit') return acc.sum(line.amount);
      return acc.subtract(line.amount);
    }, new Money(0, 0));
  }
}
