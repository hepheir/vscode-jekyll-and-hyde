import type { Comparable } from "../util/comparable";
import type { PostDTO } from "./postDTO";

export interface CategoryDTO extends Comparable<CategoryDTO> {
    names: string[];
    posts: PostDTO[];
    categories: CategoryDTO[];
}