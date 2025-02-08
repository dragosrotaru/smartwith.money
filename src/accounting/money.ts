
export class Money {
    public constructor(public dollars: number, public cents: number) {
    }

    static create(amount: string) {
        // the amount must not have more than two "." characters
        if (amount.split(".").length > 2) return new Error("Amount must not have more than two '.' characters");

        const [dollarString, centString] = amount.split(".");
        const dollars = Number(dollarString);
        const cents = Number(centString);

        // dollars and cents must be positive
        if (dollars < 0 || cents < 0) throw new Error("Dollars and cents must be positive");
        // cents must be less than 100
        if (cents >= 100) throw new Error("Cents must be less than 100");
        // dollars must be an integer
        if (dollars !== Math.floor(dollars)) throw new Error("Dollars must be an integer");
        // cents must be an integer
        if (cents !== Math.floor(cents)) throw new Error("Cents must be an integer");
        // dollars and cents must be valid numbers
        if (isNaN(dollars) || isNaN(cents)) throw new Error("Dollars and cents must be valid numbers");
        return new Money(Number(dollars), Number(cents));
    }

    isZero() {
        return this.dollars === 0 && this.cents === 0;
    }

    isEqual(other: Money) {
        return this.dollars === other.dollars && this.cents === other.cents;
    }

    sum(other: Money) {
        return new Money(this.dollars + other.dollars, this.cents + other.cents);
    }

    subtract(other: Money) {
        return new Money(this.dollars - other.dollars, this.cents - other.cents);
    }

    applyPercentage(percentage: number): [Money, Money] | Error {
        if (percentage < 0 || percentage > 1) return new Error("Percentage must be between 0 and 1");
        const totalCents = this.dollars * 100 + this.cents;
        const leftCents = totalCents * percentage;
        const rightCents = totalCents - leftCents;

        const leftDollars = Math.floor(leftCents / 100);
        const rightDollars = Math.floor(rightCents / 100);

        return [new Money(leftDollars, leftCents % 100), new Money(rightDollars, rightCents % 100)];
    }
}
