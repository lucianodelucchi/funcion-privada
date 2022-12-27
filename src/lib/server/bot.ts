import { Bot } from 'grammy';
import { BOT_INFO, BOT_TOKEN } from '$env/static/private';
import { configuration, imagesForMovie, movie, search } from  '$lib/server/tmdb';

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

bot.command("ping", (ctx) => ctx.reply(`Pong! 🏓 ${new Date()} ${Date.now()}`));

bot.command("movie", async (ctx) => {
  const id = Number.parseInt(ctx.match);
  if (isNaN(id)) {
    await ctx.reply(`No movie with ID: ${id}`);  
    return;
  }
  
  const movieResponse = await movie(id);

  if (movieResponse) {
    const images = await imagesForMovie(id);
    const image = `${configuration.images.base_url}w342${images.posters[0].file_path}`;
    await ctx.reply(`[🎬 *${addSlashes(movieResponse.title)}* 🎬](${image}) [_Data from TMDB_](https://www.themoviedb.org/)`, { parse_mode: "MarkdownV2" });
    return;
  }

  await ctx.reply(`No movie with ID: ${id}`); 
});

bot.command("search", async (ctx) => {
  const searchTerm = ctx.match?.length == 0 ? 'airplane' : ctx.match;
  
  const moviesResponse = await search(searchTerm);

  if (moviesResponse.total_results ?? 0 > 0) {
    const results = moviesResponse.results?.slice(0, 10);
    let reply = '';
    for (const movie of results) {
      reply += `🎬 [*${addSlashes(movie.title)}*](/movie ${movie.id}) *${addSlashes(movie.release_date)}* 🎬 \n`;
    } 
    await ctx.reply(reply, { parse_mode: "MarkdownV2" });
    // const firstMovie = moviesResponse.results[0];
    // const images = await imagesForMovie(firstMovie.id);
    // const image = `${configuration.images.base_url}w342${images.posters[0].file_path}`;
    // await ctx.reply(`[🎬 *${addSlashes(firstMovie.title)}* 🎬](${image}) [_Data from TMDB_](https://www.themoviedb.org/)`, { parse_mode: "MarkdownV2" });
    return;
  }

  await ctx.reply('No movies found 🤷🏼‍♂️');
});

bot.on('msg:text', ctx => ctx.reply('Say what?!?!'))