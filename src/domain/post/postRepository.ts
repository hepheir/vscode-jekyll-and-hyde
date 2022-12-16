import * as vscode from "vscode";
import type { Repository } from "../../common/repository";
import type { PostDTO } from "./postDTO";

export interface PostRepository extends Repository<PostDTO> {
    findByUri(uri: vscode.Uri): PostDTO | undefined;
}
