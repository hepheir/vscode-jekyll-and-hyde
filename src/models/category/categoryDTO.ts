import type { PostDTO } from "../post/postDTO";

export interface CategoryDTO {
    names: string[];
    posts: PostDTO[];
    categories: CategoryDTO[];
}