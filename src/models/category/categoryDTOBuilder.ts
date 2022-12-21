import type { Builder } from "../common/builder";
import { BuilderError } from "../common/builderError";
import type { PostDTO } from "../post/postDTO";
import type { CategoryDTO } from "./categoryDTO";

export class CategoryDTOBuilder implements Builder<CategoryDTO> {
    private names: string[] | undefined;
    private posts: PostDTO[] | undefined;
    private categories: CategoryDTO[] | undefined;

    setNames(names: readonly string[]): this {
        this.names = names.slice();
        return this;
    }

    setPosts(posts: readonly PostDTO[]): this {
        this.posts = posts.slice();
        return this;
    }

    setCategories(categories: readonly CategoryDTO[]): this {
        this.categories = categories.slice();
        return this;
    }

    build(): CategoryDTO {
        if (this.posts === undefined) {
            this.posts = [];
        }
        if (this.categories === undefined) {
            this.categories = [];
        }
        if (!this.isBuildable()) {
            throw new BuilderError.NotBuildable();
        }
        const newCategory: CategoryDTO = {
            names: this.names!,
            posts: this.posts,
            categories: this.categories,
        }
        return newCategory;
    }

    isBuildable(): boolean {
        return this.names !== undefined;
    }
}