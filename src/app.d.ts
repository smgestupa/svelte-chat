// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	interface MessageJSON {
		username: string;
		body: string;
		timestamp: number;
	}

	interface Message {
		username: string;
		body: string;
		date: Date;
	}

	interface RequestBody {
		username: string;
		body: string;
	}
}

export {};
