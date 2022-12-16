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
        return new _CategoryDTO(this.name!, this.posts);
    }

    isBuildable(): boolean {
        return this.name !== undefined;
    }
}

class _CategoryDTO implements CategoryDTO {
    public name: string;
    public posts: PostDTO[];

    constructor(
        name: string,
        posts: readonly PostDTO[],
    ) {
        this.name = name;
        this.posts = posts.slice();
    }

    getId(): string {
        return this.name;
    }

    copy(): CategoryDTO {
        return new _CategoryDTO(this.name, this.posts);
    }

    equals(e: CategoryDTO): boolean {
        return this.name === e.name;
    }

}