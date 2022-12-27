import { Bot, InlineKeyboard } from 'grammy';
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

bot.command("search", async (ctx) => {
  const searchTerm = ctx.match?.length == 0 ? 'airplane' : ctx.match;
  
  const moviesResponse = await search(searchTerm);

  if (moviesResponse.total_results ?? 0 > 0) {
    const results = moviesResponse.results?.slice(0, 10)!;
    const keyboard = results
        .reduce(
            (keyboard, movie) =>
                keyboard
                    .text(
                        movie.title,
                        `movie:${movie.id}`,
                    )
                    .row(),
            new InlineKeyboard(),
        );

    await ctx.reply("I've found these movies:", {
      reply_markup: keyboard
    });
    
    return;
  }

  await ctx.reply('No movies found 🤷🏼‍♂️');
});

bot.callbackQuery(/^movie:(\d+)$/, async ctx => {
  const id = Number(ctx.match![1]);
  if (isNaN(id)) {
    await ctx.answerCallbackQuery({ text: `No movie with ID: ${id}` });
    return;
  }
  
  const movieResponse = await movie(id);

  if (movieResponse) {
    const images = await imagesForMovie(id);
    const image = `${configuration.images.base_url}w342${images.posters[0].file_path}`;
    
    await ctx.reply(`[🎬 *${addSlashes(movieResponse.title)}* 🎬](${image}) [_Data from TMDB_](https://www.themoviedb.org/)`, { parse_mode: "MarkdownV2" });
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.answerCallbackQuery({text: `No movie with ID: ${id}`}); 
});

bot.on('msg:text', ctx => ctx.reply('Say what?!?!'))