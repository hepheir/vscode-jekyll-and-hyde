import type { PostDTO } from "../post/postDTO";
import type { RepositoryItem } from "../repositoryItem";

export interface CategoryDTO extends RepositoryItem<CategoryDTO> {
    name: string;
    posts: PostDTO[];
}