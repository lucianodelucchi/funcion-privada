import { WEBHOOK } from '$env/static/private';
import { bot } from  '$lib/server/bot';

export async function POST() {
    const success = await bot.api.setWebhook(WEBHOOK);
    return new Response(String(success));
}

export async function DELETE() {
    const success = await bot.api.deleteWebhook();
    return new Response(String(success));
}