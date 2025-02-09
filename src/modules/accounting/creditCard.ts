import { Money } from './money'
import { ChequingAccount, CreditCardAccount, ExpenseAccount, InterestExpenseAccount, SalesTaxAccount } from './account'
import { Description, Ledger, JournalEntry, Line } from './ledger'
import { isError } from './error'
import { UUID, uuid } from './uuid'


/* 
Features
- auto matching refunds and payments
- predictive expense categorization
- receipts
- 


*/

/** 
 * Limitations:
 * 
 * - only supports a single sales tax account for a transaction
 * - only supports a single expense account for a purchase or refund transaction
 * - only supports chequing accounts for payments
*/
export class CreditCardTransaction {
  protected constructor(
    public description: Description,
    public date: Date,
    public postedDate: Date,
    public amount: Money,
    public type: 'debit' | 'credit',
    public refundForId?: UUID,
    public id: UUID = uuid(),
  ) {}
  static create(description: Description, date: Date, postedDate: Date, amount: Money, type: 'debit' | 'credit', refundForId?: UUID) {
    if (description.length === 0) return new Error('Description cannot be empty')
    if (postedDate < date) return new Error('Posted date cannot be before the transaction date')
    if (Date.now() < date.getTime()) return new Error('Transaction date cannot be in the future')
    if (amount.isZero()) return new Error('Amount cannot be 0')
    return new CreditCardTransaction(description, date, postedDate, amount, type, refundForId)
  }
}

export class CreditCard {
  constructor(
    private ledger: Ledger,
    private card: CreditCardAccount,
    private interestAccount: InterestExpenseAccount,
    public transactions: CreditCardTransaction[] = [],
  ) {}

  static create(ledger: Ledger, card: CreditCardAccount, interestAccount: InterestExpenseAccount) {
    if (!ledger.accounts.hasAccountWithId(card.id)) return new Error('Card account not found')
    if (!ledger.accounts.hasAccountWithId(interestAccount.id)) return new Error('Interest account not found')
    return new CreditCard(ledger, card, interestAccount)
  }

  get balance() {
    return this.ledger.getBalance(this.card.id)
  }

  private addEntryAndTransaction(entry: JournalEntry, trx: CreditCardTransaction) {
    const added = this.ledger.addEntry(entry)
    if (isError(added)) return added
    this.transactions.push(trx)
    return added
  }

  findRefundFor(trx: CreditCardTransaction) {
    return this.transactions.find(t => t.refundForId === trx.id)
  }

  findOriginalForRefund(trx: CreditCardTransaction) {
    return this.transactions.find(t => t.id === trx.refundForId)
  }

  /**
   * Make a payment towards a card (considered a debit transaction)
   */
  public payment(trx: CreditCardTransaction, source: ChequingAccount) {
    const trxType = 'debit'
    if (trx.type !== trxType) return new Error(`A payment towards a card must be ${trxType} type`)

    const cardLine = Line.create(this.card, trx.amount, trxType)
    if (isError(cardLine)) return cardLine

    const sourceLine = Line.create(source, trx.amount, 'credit')
    if (isError(sourceLine)) return sourceLine

    const entry = JournalEntry.create(trx.description, trx.date, [cardLine, sourceLine], trx.id)
    if (isError(entry)) return entry
    
    return this.addEntryAndTransaction(entry, trx);
  }

  /**
   * Receive a refund on a card (considered a debit transaction)
   */
  public refund(trx: CreditCardTransaction, expense: ExpenseAccount, salesTax?: SalesTaxAccount) {
    const trxType = 'debit'
    if (trx.type !== trxType) return new Error(`A refund must be ${trxType} type`)

    if (!this.findOriginalForRefund(trx)) return new Error('Original transaction not found')

    const lines: Line[] = []

    const cardLine = Line.create(this.card, trx.amount, trxType)
    if (isError(cardLine)) return cardLine
    lines.push(cardLine)

    let expenseAmount = trx.amount;

    if (salesTax) {
      const appliedTax = salesTax.apply(expenseAmount);
      if (isError(appliedTax)) return appliedTax;

      const [tax, expense] = appliedTax;
      expenseAmount = expense;

      const salesTaxLine = Line.create(salesTax, tax, 'debit')
      if (isError(salesTaxLine)) return salesTaxLine
      lines.push(salesTaxLine)
    }

    const expenseLine = Line.create(expense, expenseAmount, 'credit')
    if (isError(expenseLine)) return expenseLine
    lines.push(expenseLine)


    const entry = JournalEntry.create(trx.description, trx.date, lines, trx.id)
    if (isError(entry)) return entry

    return this.addEntryAndTransaction(entry, trx);
  }

  /**
   * Make a purchase on a card (considered a credit transaction)
   */
  public purchase(trx: CreditCardTransaction, expense: ExpenseAccount, salesTax?: SalesTaxAccount) {
    const trxType = 'credit'
    if (trx.type !== trxType) return new Error(`A credit card purchase must be ${trxType} type`)

    if (expense.type !== 'expense') return new Error('An expense can only come from an expense account')

    const lines: Line[] = []

    const cardLine = Line.create(this.card, trx.amount, trxType)
    if (isError(cardLine)) return cardLine
    lines.push(cardLine)

    let expenseAmount = trx.amount;

    if (salesTax) {
      const appliedTax = salesTax.apply(expenseAmount);
      if (isError(appliedTax)) return appliedTax;

      const [tax, expense] = appliedTax;
      expenseAmount = expense;

      const salesTaxLine = Line.create(salesTax, tax, 'credit')
      if (isError(salesTaxLine)) return salesTaxLine
      lines.push(salesTaxLine)
    }

    const expenseLine = Line.create(expense, expenseAmount, 'debit')
    if (isError(expenseLine)) return expenseLine
    lines.push(expenseLine)

    const entry = JournalEntry.create(trx.description, trx.date, lines, trx.id)
    if (isError(entry)) return entry

    return this.addEntryAndTransaction(entry, trx);
  }

  /**
   * Apply interest to a card (considered a credit transaction)
   */
  public interest(trx: CreditCardTransaction) {
    const trxType = 'credit'
    if (trx.type !== trxType) return new Error(`An interest transaction must be ${trxType} type`)

    const cardLine = Line.create(this.card, trx.amount, trxType)
    if (isError(cardLine)) return cardLine

    const interestLine = Line.create(this.interestAccount, trx.amount, 'debit')
    if (isError(interestLine)) return interestLine

    const entry = JournalEntry.create(trx.description, trx.date, [cardLine, interestLine], trx.id)
    if (isError(entry)) return entry

    return this.addEntryAndTransaction(entry, trx);
  }
}
