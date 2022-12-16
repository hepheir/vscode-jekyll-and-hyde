import type { Uri } from "vscode";
import { ArrayRepository } from "../arrayRepository";
import type { PostDTO } from "./postDTO";
import type { PostRepository } from "./postRepository";

export class ArrayPostRepository extends ArrayRepository<PostDTO> implements PostRepository {
    findByUri(uri: Uri): PostDTO | undefined {
        return this.find(post => post.uri.fsPath === uri.fsPath);
    }
}