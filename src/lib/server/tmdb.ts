import { TMDB_API_KEY } from '$env/static/private';
import { MovieDb } from 'moviedb-promise';

const moviedb = new MovieDb(TMDB_API_KEY);
export const configuration = await moviedb.configuration();

export const search = async (name: string) => {
    return await moviedb.searchMovie({query: name});
}

export const imagesForMovie = async (id: number) => {
    return await moviedb.movieImages(id);
}