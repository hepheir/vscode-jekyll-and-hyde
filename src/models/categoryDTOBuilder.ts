import type { Builder } from "../util/builder";
import { BuilderError } from "../util/builderError";
import { Heap } from "../util/heap";
import type { PostDTO } from "./postDTO";
import type { CategoryDTO } from "./categoryDTO";

export class CategoryDTOBuilder implements Builder<CategoryDTO> {
    private names: string[] = [];
    private posts: PostDTO[] = new Heap<PostDTO>();
    private categories: CategoryDTO[] = new Heap<CategoryDTO>();

    setNames(names: readonly string[]): this {
        this.names = names.slice();
        return this;
    }

    setPosts(posts: readonly PostDTO[]): this {
        this.posts = new Heap<PostDTO>();
        this.posts.push(...posts);
        return this;
    }

    setCategories(categories: readonly CategoryDTO[]): this {
        this.categories = new Heap<CategoryDTO>();
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
            compareTo: (category) => this.names.join('/').localeCompare(category.names.join('/')),
        }
        return newCategory;
    }

    isBuildable(): boolean {
        return true;
    }
}