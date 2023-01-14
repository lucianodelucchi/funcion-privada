import { searchMulti } from "$lib/server/tmdb";
import { error, json, type RequestEvent } from "@sveltejs/kit";

export async function GET({url} : RequestEvent) {
    const name = url.searchParams.get('name');

    if (name == null) {
      throw error(400); 
    }

    const response = await searchMulti(name);
    return json(response);
}