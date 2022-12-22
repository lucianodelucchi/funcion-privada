import { Bot } from 'grammy';
import { BOT_INFO, BOT_TOKEN } from '$env/static/private';
import { configuration, imagesForMovie, search } from  '$lib/server/tmdb';

function addSlashes(str: string) {
  return (str + '').replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const options = {
  botInfo: JSON.parse(BOT_INFO)
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
