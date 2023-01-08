import { Heap } from "../common/iterable/heap";
import { PostDTO } from "./postDTO";

export class PostDTOHeap extends Heap<PostDTO> {
    override getComparableKey = (post: PostDTO) => {
        return post.title;
    }
}