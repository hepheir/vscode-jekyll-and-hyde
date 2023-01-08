import type { Builder } from "../common/builder";
import { BuilderError } from "../common/builderError";
import type { PostDTO } from "../post/postDTO";
import { PostDTOHeap } from "../post/postDTOHeap";
import type { CategoryDTO } from "./categoryDTO";
import { CategoryDTOHeap } from "./categoryDTOHeap";

export class CategoryDTOBuilder implements Builder<CategoryDTO> {
    private names: string[] = [];
    private posts: PostDTO[] = new PostDTOHeap();
    private categories: CategoryDTO[] = new CategoryDTOHeap();

    setNames(names: readonly string[]): this {
        this.names = names.slice();
        return this;
    }

    setPosts(posts: readonly PostDTO[]): this {
        this.posts = new PostDTOHeap();
        this.posts.push(...posts);
        return this;
    }

    setCategories(categories: readonly CategoryDTO[]): this {
        this.categories = new CategoryDTOHeap();
        this.categories.push(...categories);
        return this;
    }

    build(): CategoryDTO {
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
        return true;
    }
}