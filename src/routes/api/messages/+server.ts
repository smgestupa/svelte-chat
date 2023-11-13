import { addMessageListener } from '$lib/message';
import { encodeBase64 } from 'oslo/encoding';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const textEncoder = new TextEncoder();
	let unsubscribe: () => void;

	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(textEncoder.encode('\n'));

			unsubscribe = addMessageListener((message) => {
				let messageJson = JSON.stringify({
					username: message.username,
					body: message.body,
					timestamp: Math.floor(message.date.getTime() / 1000)
				});

				messageJson = encodeBase64(new TextEncoder().encode(messageJson));
				controller.enqueue(textEncoder.encode('event: message\n'));
				controller.enqueue(textEncoder.encode('data: ' + messageJson + '\n\n'));
			});
		},

		cancel() {
			console.log('Cancelled.');
			unsubscribe();
		}
	});

	return new Response(stream, {
		headers: {
			'X-Content-Type-Options': 'nosniff',
			'Content-Type': 'text/event-stream; charset=utf-8',
			'Transfer-Encoding': 'chunked'
		}
	});
};
