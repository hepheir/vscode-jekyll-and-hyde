export function throttle<T extends (...args: any[]) => ReturnType<T>>(fn: T, delay: number) {
	let waiting = false;
	let waitingArgs: Parameters<T> | undefined;

	return function (this: unknown, ...args: Parameters<T>) {
		if (waiting) {
			waitingArgs = args;
			return;
		}

		waiting = true;
		fn.apply(this, args);

		setTimeout(() => {
			waiting = false;
			if (waitingArgs != null) {
				fn.apply(this, waitingArgs);
			}
		}, delay);
	};
}
