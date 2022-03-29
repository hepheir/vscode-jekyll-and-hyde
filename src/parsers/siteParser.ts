import { workspace } from "vscode";
import { Site } from "jekyll";
import { PageParser } from "./pageParser";
import { CategoriesParser } from "./categoriesParser";

export class SiteParser {
    /**
     * Parses `Site` from current workspace folder.
     *
     * @returns {Promise<Site>}
     */
    public static async parse(): Promise<Site> {
        // TODO: make paths configurable
        const draftUris = await workspace.findFiles('_drafts/**/*.{md,markdown}');
        const postUris = await workspace.findFiles('_posts/**/*.{md,markdown}');
        const pageUris = await workspace.findFiles('_pages/**/*.{md,markdown}');

        const drafts = await Promise.all(draftUris.map(uri => PageParser.from(uri)));
        const pages = await Promise.all(pageUris.map(uri => PageParser.from(uri)));
        const posts = await Promise.all(postUris.map(uri => PageParser.from(uri)));

        const categories = CategoriesParser.from([...drafts, ...pages, ...posts]);

        const site: Site = {
            time: new Date(Date.now()),
            pages: [...pages],
            posts: [...posts, ...drafts],
            categories: categories
        };
        return site;
    }
}
