import { sendMessage } from '$lib/message';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const requestBody: RequestBody = await request.json();
	sendMessage(requestBody.username, requestBody.body);

	return new Response(null);
};
