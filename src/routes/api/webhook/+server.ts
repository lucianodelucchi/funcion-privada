import { env } from '$env/dynamic/private';
import { bot } from  '$lib/server/bot';
import { error, type RequestEvent } from '@sveltejs/kit';

export async function POST({request}: RequestEvent) {
    const { webhook_url } = await request.json();
    const webhookUrl = env?.VERCEL_URL ?? webhook_url;
    
    if (!webhookUrl) {
        throw error(500);
    }
    
    const success = await bot.api.setWebhook(`https://${webhookUrl}/api`);
    return new Response(String(success));
}

export async function DELETE() {
    const success = await bot.api.deleteWebhook();
    return new Response(String(success));
}