import * as vscode from "vscode";
import { Site, Page } from "jekyll";
import { PageParser } from "./pageParser";
import { CategoriesParser } from "./categoriesParser";
import { getWorkspaceFolder } from "../settings";

export class SiteParser {
    /**
     * Parses `Site` from current workspace folders.
     *
     * @returns {Promise<Site>}
     */
    public static async parse(): Promise<Site> {
        // TODO: make paths configurable
        const drafts = await this.parsePagesFromWorkspaceFolder('**/_drafts/**/*.{md,markdown}')
        const posts = await this.parsePagesFromWorkspaceFolder('**/_posts/**/*.{md,markdown}')
        const pages = await this.parsePagesFromWorkspaceFolder('**/_pages/**/*.{md,markdown}')
        const categories = CategoriesParser.from([...drafts, ...pages, ...posts]);
        const site: Site = {
            time: new Date(),
            pages: [...pages],
            posts: [...posts, ...drafts],
            categories: categories
        };
        return site;
    }

    /**
     * Create an empty `Site` object.
     *
     * @returns {Site}
     */
    public static new(): Site {
        return {
            categories: {},
            pages: [],
            posts: [],
            time: new Date(),
        };
    }

    private static async parsePagesFromWorkspaceFolder(globPattern: string): Promise<Page[]> {
        const uris = await this.findFilesFromWorkspaceFolder(globPattern);
        return await Promise.all(uris.map(uri => PageParser.parse(uri)));
    }

    private static async findFilesFromWorkspaceFolder(globPattern: string): Promise<vscode.Uri[]> {
        const workspaceFolder = getWorkspaceFolder();
        const relativePattern = new vscode.RelativePattern(workspaceFolder, globPattern)
        return await vscode.workspace.findFiles(relativePattern);
    }
}
