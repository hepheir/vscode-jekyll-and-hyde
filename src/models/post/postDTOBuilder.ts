import * as vscode from "vscode";
import * as path from "path";
import type { Frontmatter } from "./frontmatter";
import type { PostDTO } from "./postDTO";
import type { Builder } from "../builder";
import { BuilderError } from "../builderError";

export class PostDTOBuilder implements Builder<PostDTO> {
    private uri: vscode.Uri | undefined;
    private title: string | undefined;
    private categories: string[] | undefined;
    private frontmatter: Frontmatter = {};

    setUri(uri: vscode.Uri): this {
        this.uri = uri;
        return this;
    }

    setTitle(title: string): this {
        this.title = title;
        return this;
    }

    setCategories(categories: readonly string[]): this {
        this.categories = categories.slice();
        return this;
    }

    setFrontmatter(frontmatter: Frontmatter): this {
        this.frontmatter = frontmatter;
        this.title = this.frontmatter.title ?? this.title;
        this.categories = this.frontmatter.categories?.slice() ?? this.categories;
        return this;
    }

    build(): PostDTO {
        if (this.title === undefined) {
            this.title = this.frontmatter?.title ?? this.parseBasename().title;
        }
        if (this.categories === undefined) {
            this.categories = this.frontmatter?.categories?.slice() ?? [];
        }
        if (!this.isBuildable()) {
            throw new BuilderError.NotBuildable();
        }
        return new _PostDTO(this.uri!, this.title!, this.categories, this.frontmatter);
    }

    private parseBasename(): { date: string; title: string; ext: string; } {
        const basename = path.basename(this.uri!.path);
        const basenameMatcher = /^((?<date>\d{4}-\d{2}-\d{2})-)?(?<title>.+)\.(?<ext>\w+)$/;
        if (!basenameMatcher.test(basename)) {
            throw new BuilderError.NotBuildable('Could not parse post basename: '+basename);
        }
        const { date, title, ext } = basenameMatcher.exec(basename)?.groups!;
        return { date, title, ext };
    }

    isBuildable(): boolean {
        return this.uri !== undefined
            && this.title !== undefined
            && this.categories !== undefined
            && Array.isArray(this.categories);
    }
}

class _PostDTO implements PostDTO {
    public uri: vscode.Uri;
    public title: string;
    public categories: string[];
    public frontmatter: Frontmatter;

    constructor(
        uri: vscode.Uri,
        title: string,
        categories: string[],
        frontmatter: Frontmatter,
    ) {
        this.uri = uri;
        this.title = title;
        this.categories = categories;
        this.frontmatter = {
            ...frontmatter,
            categories: categories,
        };
    }

    getId(): string {
        return this.title;
    }

    copy(): PostDTO {
        return new _PostDTO(this.uri, this.title, this.categories, this.frontmatter);
    }

    equals(e: PostDTO): boolean {
        return this.uri.fsPath === e.uri.fsPath;
    }

}