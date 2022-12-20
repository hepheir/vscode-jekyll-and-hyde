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
        const newPost: PostDTO = {
            uri: this.uri!,
            title: this.title!,
            categories: this.categories,
            frontmatter: {
                ...this.frontmatter,
                categories: this.categories,
            },
        };
        return newPost;
    }

    isBuildable(): boolean {
        return this.uri !== undefined
            && this.title !== undefined
            && this.categories !== undefined
            && Array.isArray(this.categories);
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
}