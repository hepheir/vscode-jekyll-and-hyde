import type { Builder } from "../builder";
import { BuilderError } from "../builderError";
import type { PostDTO } from "../post/postDTO";
import type { CategoryDTO } from "./categoryDTO";

export class CategoryDTOBuilder implements Builder<CategoryDTO> {
    private name: string | undefined;
    private posts: PostDTO[] | undefined;

    setName(name: string): this {
        this.name = name;
        return this;
    }

    setPosts(posts: readonly PostDTO[]): this {
        this.posts = posts.slice();
        return this;
    }

    build(): CategoryDTO {
        if (this.posts === undefined) {
            this.posts = [];
        }
        if (!this.isBuildable()) {
            throw new BuilderError.NotBuildable();
        }
        const newCategory: CategoryDTO = {
            name: this.name!,
            posts: this.posts,
        }
        return newCategory;
    }

    isBuildable(): boolean {
        return this.name !== undefined;
    }
}