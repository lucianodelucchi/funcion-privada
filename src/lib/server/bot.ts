import { Bot, InlineKeyboard } from 'grammy';
import { BOT_INFO, BOT_TOKEN } from '$env/static/private';
import { configuration, movie, search, searchMulti, templateForMultiResponse } from  '$lib/server/tmdb';

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
  { command: "movie", description: "Search for the provided movie and shows 10 results" },
  { command: "search", description: "Search for Movies, Tv and Persons with the provided name" },
]);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("ping", (ctx) => ctx.reply(`Pong! 🏓 ${new Date()} ${Date.now()}`));

bot.command("movie", async (ctx) => {
  const searchTerm = ctx.match?.length == 0 ? 'airplane' : ctx.match;
  
  const moviesResponse = await search(searchTerm);

  if (moviesResponse.total_results ?? 0 > 0) {
    const results = moviesResponse.results?.slice(0, 10)!;
    const keyboard = results
        .reduce(
            (keyboard, movie) => 
              keyboard
                    .text(
                        `${movie.title ?? 'N/A'} (${movie.release_date})`,
                        `movie:${movie.id}`,
                    ).row(),
            new InlineKeyboard(),
        );

    await ctx.reply("I've found these movies:", {
      reply_markup: keyboard
    });
    
    return;
  }

  await ctx.reply('No movies found 🤷🏼‍♂️');
});

bot.command("search", async (ctx) => {
  const searchTerm = ctx.match?.length == 0 ? 'airplane' : ctx.match;
  
  const multiResponse = await searchMulti(searchTerm);

  if (multiResponse.total_results ?? 0 > 0) {
    const results = multiResponse.results?.slice(0, 10)!;
    const keyboard = results
        .reduce(
            (keyboard, result) => {
              const info = templateForMultiResponse(result);
              return keyboard
                    .text(
                        `${info.icon} ${info.name ?? 'N/A'} ${info.meaninful_date ?? ''}`,
                        // `result:${info.name}:${info.image_path}`,
                        `result:${result.id}:${info.name}:${result.media_type}:${info.image_path}`,
                    ).row()
                  },
            new InlineKeyboard(),
        );

    await ctx.reply("I've found these results:", {
      reply_markup: keyboard
    });
    
    return;
  }

  await ctx.reply('No movies found 🤷🏼‍♂️');
});

bot.callbackQuery(/^result:(\d+):(.+):(.+):(.+):(.+)$/, async ctx => {
  const [, paramId, name, mediaType, imagePath] = ctx.match!;
  const id = Number(paramId);
  
  if (isNaN(id)) {
    await ctx.answerCallbackQuery({ text: `Nothing found with ID: ${id}` });
    return;
  }
 
  if (imagePath) {
    const image = `${configuration.images.secure_base_url}w342${imagePath}`;
    
    await ctx.reply(
      `_All data from TMDB_
[${name}](https://www.themoviedb.org/${mediaType}/${id})`
      ,
      { parse_mode: "MarkdownV2" }
    );
    await ctx.replyWithPhoto(image);
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.answerCallbackQuery({text: `No TV show with ID: ${id}`}); 
});

// bot.callbackQuery(/^movie:(\d+):(.+)$/, async ctx => {
//   const [, paramId, imagePath] = ctx.match!;
//   const id = Number(paramId);
  
//   if (isNaN(id)) {
//     await ctx.answerCallbackQuery({ text: `No Movie with ID: ${id}` });
//     return;
//   }
 
//   if (imagePath) {
//     const image = `${configuration.images.secure_base_url}w342${imagePath}`;
    
//     await ctx.reply(
//       `_All data from TMDB_
// [🎬](https://www.themoviedb.org/movie/${id})`
//       ,
//       { parse_mode: "MarkdownV2" }
//     );
//     await ctx.replyWithPhoto(image);
//     await ctx.answerCallbackQuery();
//     return;
//   }

//   await ctx.answerCallbackQuery({text: `No Movie with ID: ${id}`}); 
// });

bot.callbackQuery(/^movie:(\d+)$/, async ctx => {
  const id = Number(ctx.match![1]);
  if (isNaN(id)) {
    await ctx.answerCallbackQuery({ text: `No movie with ID: ${id}` });
    return;
  }
  
  const { images, ...movieDetails} = await movie(id);

  if (movieDetails) {
    const image = `${configuration.images.secure_base_url}w342${images.posters[0]?.file_path}`;
    
    await ctx.reply(
      `_All data from TMDB_
🎬: [${addSlashes(movieDetails.title!)}](https://www.themoviedb.org/movie/${movieDetails.id})
📆: ${addSlashes(movieDetails.release_date!)}`
// [${addSlashes(image)}](${image})
      ,
      { parse_mode: "MarkdownV2" }
    );
    // await ctx.reply(`[🎬](${image}) [_Data from TMDB_](https://www.themoviedb.org/)`, { parse_mode: "MarkdownV2" });
    await ctx.replyWithPhoto(image);
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.answerCallbackQuery({text: `No movie with ID: ${id}`}); 
});

bot.on('msg:text', ctx => ctx.reply(`${ctx.message?.text} back to you`));
bot.on('msg:animation', ctx => ctx.replyWithAnimation(ctx.message?.animation.file_id));