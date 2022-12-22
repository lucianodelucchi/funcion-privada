import { Bot } from 'grammy';
import { BOT_TOKEN } from '$env/static/private';
import type { UserFromGetMe } from 'grammy/out/types';
import { configuration, imagesForMovie, search } from  '$lib/server/tmdb';

function addSlashes(str: string) {
  return (str + '').replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const userFromGetMe: UserFromGetMe = {
  id: 5637493633,
  is_bot: true,
  first_name: 'Función Privada 🥃',
  username: 'FuncionPrivadaBot',
  can_join_groups: true,
  can_read_all_group_messages: false,
  supports_inline_queries: false
};

const options = {
  botInfo: userFromGetMe
}

export const bot = new Bot(BOT_TOKEN, options);

await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "ping", description: "Sends the infamous PONG back" },
  { command: "search", description: "Search for the provided movie and shows the first poster of first result" },
]);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));

bot.command("search", async (ctx) => {
  const searchTerm = ctx.match?.length == 0 ? 'airplane' : ctx.match;
  
  const moviesResponse = await search(searchTerm);

  if (moviesResponse.total_results ?? 0 > 0) {
    const firstMovie = moviesResponse.results[0];
    const images = await imagesForMovie(firstMovie.id);
    const image = `${configuration.images.base_url}w342${images.posters[0].file_path}`;
    await ctx.reply(`[🎬 *${addSlashes(firstMovie.title)}* 🎬](${image}) [_Data from TMDB_](https://www.themoviedb.org/)`, { parse_mode: "MarkdownV2" });
    return;
  }

  await ctx.reply('No movies found 🤷🏼‍♂️');
});
