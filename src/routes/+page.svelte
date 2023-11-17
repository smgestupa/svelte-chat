<script lang="ts">
	import { onMount } from 'svelte';
	import { decodeBase64 } from 'oslo/encoding';
	import '../app.postcss';

	let messages: Array<Message> = [];

	const sendMessage = async (event: any): Promise<void> => {
		const formData = new FormData(event.target as HTMLFormElement);
		const username = formData.get('username');
		const body = formData.get('body');

		if (!username || !body || typeof username !== 'string' || typeof body !== 'string') return;

		await fetch('/api/message', {
			method: 'POST',
			body: JSON.stringify({
				username,
				body
			})
		});

		(event.target[1] as HTMLInputElement).value = '';
	};

	const renderMessage = (message: Message): void => {
		messages = [message, ...messages];
	};

	const listen = async (): Promise<void> => {
		const response = await fetch('/api/messages');

		if (!response.body) throw new Error('Invalid response body.');

		const reader = response.body.getReader();

		let result = await reader.read();
		let lastChunk = '';

		while (!result.done) {
			const value = lastChunk + new TextDecoder().decode(result.value);
			const chunks = value.split('\n\n');
			const completedGroup = chunks.slice(0, -1);

			lastChunk = chunks.at(-1) ?? '';
			for (const chunk of completedGroup) {
				const lines = chunk.split('\n').filter((value) => value != '');
				const maybeEventLine = lines.at(0);

				let event: string | null = null;

				if (maybeEventLine && maybeEventLine.startsWith('event: ')) {
					event = maybeEventLine.replace('event: ', '');
					lines.shift();
				}

				if (event !== 'message') {
					throw new Error('Event no defined.');
				}

				for (const line of lines) {
					if (!line.startsWith('data: ')) throw new Error(`Expected data, got:\n${line}`);

					const messageJson: MessageJSON = JSON.parse(
						new TextDecoder().decode(decodeBase64(line.replace('data: ', '')))
					);

					const { username, body, timestamp } = messageJson;

					renderMessage({
						username,
						body,
						date: new Date(timestamp * 1000)
					});
				}
			}

			result = await reader.read();
		}
	};

	onMount(listen);
</script>

<h1 class="text-2xl font-semibold">Realtime chat with Fetch API</h1>

<div class="border-b py-4">
	<form method="post" action="/api/message" on:submit|preventDefault={sendMessage}>
		<label class="mt-2" for="username">Username</label><br />
		<input class="w-full border p-1" type="text" name="username" />

		<label class="mt-2" for="message-value">Message</label><br />
		<input class="w-full border p-1" type="text" name="body" />

		<button class="mt-2 bg-black px-4 text-white" type="submit">Send</button>
	</form>

	<div class="flex flex-col gap-y-4 pt-8">
		{#each messages as { username, body, date }}
			<div class="mb-1 flex gap-x-2">
				<p class="font-medium">{username}</p>
				<p class="text-zinc-400">Sent at {date.toLocaleString()}</p>
			</div>
			<p>{body}</p>
		{/each}
	</div>
</div>
