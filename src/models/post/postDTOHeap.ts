import { Heap } from "../../util/heap/heap";
import { PostDTO } from "./postDTO";

export class PostDTOHeap extends Heap<PostDTO> {
    override getComparableKey = (post: PostDTO) => {
        return post.title;
    }
}