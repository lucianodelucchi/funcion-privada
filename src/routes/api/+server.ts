import { error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { bot } from  '$lib/server/bot';

export async function POST({request}: RequestEvent) {
    try {
        const requestAsJson = await request.json();
        if (!bot.isInited()) {
            console.warn('initializing bot');
            await bot.init();
        }
        await bot.handleUpdate(requestAsJson);
    } catch (error) {
        console.error(error);
    }

    return new Response();
}