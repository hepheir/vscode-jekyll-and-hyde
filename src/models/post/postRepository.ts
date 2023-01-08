import type { CrudRepository } from "../../util/repository/crudRepository";
import { ArrayCrudRepository } from "../../util/repository/implements/arrayCrudRepository";
import type { PostDTO } from "./postDTO";

export class PostRepository extends ArrayCrudRepository<PostDTO> implements CrudRepository<PostDTO> {
    override getId = (entity: PostDTO) => {
        return entity.uri.fsPath;
    };

    override copy = (entity: PostDTO) => {
        const newCategories = entity.categories.slice();
        const newPost: PostDTO = {
            uri: entity.uri,
            title: entity.title,
            categories: newCategories,
            frontmatter: {
                ...entity.frontmatter,
                categories: newCategories,
            },
        };
        return newPost;
    };
}
