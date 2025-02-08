import { Money } from "./money";
import { uuid, UUID } from "./uuid";

export type AccountName = string;

function nameError() {
    return new Error("Account name cannot be empty");
}

export class CreditCardAccount {
    public static readonly type = "credit_card";
    public readonly type = CreditCardAccount.type;
    public constructor(public name: AccountName, public id: UUID = uuid()) {}

    static create(name: AccountName) {
        if (name.length === 0) return nameError();
        return new CreditCardAccount(name);
    }
}

export class ChequingAccount {
    public static readonly type = "chequing";
    public readonly type = ChequingAccount.type;
    public constructor(public name: AccountName, public id: UUID = uuid()) {}

    static create(name: AccountName) {
        if (name.length === 0) return nameError();
        return new ChequingAccount(name);
    }
}

export class CashAccount {
    public static readonly type = "cash";
    public readonly type = CashAccount.type;
    public constructor(public name: AccountName, public id: UUID = uuid()) {}

    static create(name: AccountName) {
        if (name.length === 0) return nameError();
        return new CashAccount(name);
    }
}

export class ExpenseAccount {
    public static readonly type = "expense";
    public readonly type = ExpenseAccount.type;
    public constructor(public name: AccountName, public id: UUID = uuid()) {}

    static create(name: AccountName) {
        if (name.length === 0) return nameError();
        return new ExpenseAccount(name);
    }

}

export class InterestExpenseAccount {
    public static readonly type = "interest_expense";
    public readonly type = InterestExpenseAccount.type;
    public constructor(public name: AccountName, public account: UUID, public id: UUID = uuid()) {}

    static create(name: AccountName, account: CreditCardAccount) {
        if (name.length === 0) return nameError();
        return new InterestExpenseAccount(name, account.id);
    }
}

export class SalesTaxAccount {
    public static readonly type = "sales_tax"
    public readonly type = SalesTaxAccount.type;
    public constructor(public name: AccountName, public rate: number, public id: UUID = uuid()) {}

    static create(name: AccountName, rate: number) {
        if (name.length === 0) return nameError();
        if (rate < 0 || rate > 1) return new Error("Rate must be between 0 and 1");
        return new SalesTaxAccount(name, rate);
    }

    apply(amount: Money) {
        return amount.applyPercentage(this.rate);
    }
}

export type Account = CreditCardAccount | ChequingAccount | CashAccount | ExpenseAccount | SalesTaxAccount | InterestExpenseAccount;

export type AccountType = Account['type'];
