import * as vscode from "vscode";
import type { PostRepository } from "./postRepository";
import { ArrayPostRepository } from "./arrayPostRepository";
import { PostFileWriter } from "./postFileWriter";
import { RepositoryError } from "../../common/repositoryError";
import { PostFileReader } from "./postFileReader";

/**
 * - *Note*: this service will affect neither `CategoryService` nor `CategoryRepository`.
 */
export class PostService {
    private readonly postRepository: PostRepository;

    constructor() {
        this.postRepository = new ArrayPostRepository();
    }

    add = (uri: vscode.Uri) => {
        const newPost = new PostFileReader(uri).read();
        this.postRepository.add(newPost);
        return newPost;
    }

    list = () => {
        return this.postRepository.list();
    }

    find = (uri: vscode.Uri) => {
        return this.postRepository.findByUri(uri);
    }

    private ensureFind = (uri: vscode.Uri) => {
        return this.postRepository.ensureFind(post => post.uri.fsPath === uri.fsPath);
    }

    getTitle = (
        uri: vscode.Uri,
    ) => {
        return this.ensureFind(uri).title;
    }

    setTitle = (
        uri: vscode.Uri,
        title: string,
    ) => {
        const post = this.ensureFind(uri);
        post.title = title;
        new PostFileWriter(post, true).write();
        this.postRepository.update(post);
    }

    getCategories = (
        uri: vscode.Uri,
    ) => {
        return this.ensureFind(uri).categories;
    }

    addCategory = (
        uri: vscode.Uri,
        categoryName: string
    ) => {
        const post = this.ensureFind(uri);
        post.categories.push(categoryName);
        new PostFileWriter(post, true);
        this.postRepository.update(post);
    }

    replaceCategory = (
        uri: vscode.Uri,
        oldCategoryName: string,
        newCategoryName: string,
    ) => {
        const post = this.ensureFind(uri);
        const categoryIndex = post.categories.findIndex(name => name === oldCategoryName);
        if (categoryIndex === -1) {
            throw new RepositoryError.ItemNotFound();
        }
        post.categories[categoryIndex] = newCategoryName;
        this.postRepository.update(post);
    }

    removeCategory = (
        uri: vscode.Uri,
        categoryName: string,
    ) => {
        const post = this.ensureFind(uri);
        post.categories = post.categories.filter(name => name !== categoryName);
        this.postRepository.update(post);
    }
}