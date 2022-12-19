import type { PostDTO } from "../post/postDTO";

export interface CategoryDTO {
    name: string;
    posts: PostDTO[];
}