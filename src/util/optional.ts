export class NoSuchElementError extends Error {}

export class Optional<T> {
    public static of<T>(x: T): Optional<T> {
        return new Optional(x);
    }

    public static empty<T>(): Optional<T> {
        return new Optional<T>(null);
    }

    public static ofNullable<T>(x: T | null | undefined): Optional<T> {
        return new Optional<T>(x ?? null);
    }

    private constructor(private readonly value: T | null) { }

    get(): T {
        return this.orElseThrow();
    }

    isEmpty(): boolean {
        return this.value === null;
    }

    ifEmpty(callbackfn: () => void): void {
        if (this.isEmpty()) {
            callbackfn();
        }
    }

    isPresent(): boolean {
        return !this.isEmpty();
    }

    ifPresent(callbackfn: (x: T) => void): void {
        if (this.isPresent()) {
            callbackfn(this.get());
        }
    }

    orElse<S>(x: S): T | S {
        return (this.value === null) ? x : this.value;
    }

    orElseGet<S>(supplier: () => S): T | S {
        return (this.value === null) ? supplier() : this.value;
    }

    orElseThrow(): T {
        if (this.value === null) {
            throw new NoSuchElementError();
        }
        return this.value;
    }
}