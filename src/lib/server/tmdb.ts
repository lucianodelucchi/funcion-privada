import { TMDB_API_KEY } from '$env/static/private';
import { MovieDb, type MovieImagesResponse, type MovieResponse, type MovieResult, type PersonResult, type TvResult } from 'moviedb-promise';

const moviedb = new MovieDb(TMDB_API_KEY);
export const configuration = await moviedb.configuration();

export const search = async (name: string) => {
    return await moviedb.searchMovie({query: name, include_adult: false});
}

export const movie = async (id: number) => {
    return await moviedb.movieInfo({id, append_to_response: 'images'}) as MovieResponse & { images: MovieImagesResponse };
}

export const searchMulti = async (name: string) => {
    return await moviedb.searchMulti({ query: name, include_adult: false});
}

export const templateForMultiResponse = (response: MovieResult | TvResult | PersonResult): 
    {name?: string, image_path?: string, meaninful_date?: string, icon: string} => 
{
    if(isMovie(response)) {
        return { image_path: response.poster_path, name: response.title, meaninful_date: response.release_date, icon: '🎬'};
    }

    if(isTv(response)) {
        return { image_path: response.poster_path, name: response.name, meaninful_date: response.first_air_date, icon: '📺'};
    }

    if(isPerson(response)) {
        return { image_path: response.profile_path, name: response.name, icon: '🎭'};
    }

    throw new Error('Maybe a new media_type was added?');
}

function isMovie(obj: MovieResult | TvResult | PersonResult): obj is MovieResult {
    return obj.media_type === 'movie';
}

function isTv(obj: MovieResult | TvResult | PersonResult): obj is TvResult {
    return obj.media_type === 'tv';
}

function isPerson(obj: MovieResult | TvResult | PersonResult): obj is PersonResult {
    return obj.media_type === 'person';
}