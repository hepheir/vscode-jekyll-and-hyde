import type { PostDTO } from "../post/postDTO";
import type { CategoryDTO } from "./categoryDTO";
import type { CategoryRepository } from "./categoryRepository";
import type { PostService } from "../post/postService";
import { CategoryDTOBuilder } from "./categoryDTOBuilder";
import { ArrayCategoryRepository } from "./arrayCategoryRepository";

export class CategoryService {
    private readonly categoryRepository: CategoryRepository;

    constructor(
        private readonly postService: PostService,
    ) {
        this.categoryRepository = new ArrayCategoryRepository();
    }

    find(name: string): CategoryDTO | undefined {
        return this.categoryRepository.findByName(name);
    }

    private ensureFind(name: string): CategoryDTO {
        return this.categoryRepository.ensureFind(category => category.name === name);
    }

    create(name: string): CategoryDTO {
        const oldCategory = this.categoryRepository.findByName(name);
        if (oldCategory !== undefined) {
            return oldCategory;
        }
        const newCategory = new CategoryDTOBuilder()
            .setName(name)
            .build();
        this.categoryRepository.add(newCategory);
        return newCategory;
    }

    list(): readonly CategoryDTO[] {
        return this.categoryRepository.list();
    }

    rename(oldName: string, newName: string): void {
        const oldCategory = this.ensureFind(oldName);
        const newCategory = oldCategory.copy();
        newCategory.name = newName;
        this.categoryRepository.remove(oldCategory);
        this.categoryRepository.add(newCategory);
        newCategory.posts.forEach(post => {
            this.postService.replaceCategory(post.uri, oldCategory.name, newCategory.name);
        });
    }

    remove(name: string) {
        const category = this.ensureFind(name);
        category.posts.forEach(post => {
            this.postService.removeCategory(post.uri, name);
        });
        this.categoryRepository.remove(category);
    }

    addPost(categoryName: string, post: PostDTO): void {
        const category = this.ensureFind(categoryName);
        category.posts.push(post);
        this.categoryRepository.update(category);
        this.postService.addCategory(post.uri, categoryName);
    }

    removePost(categoryName: string, post: PostDTO): void {
        const category = this.ensureFind(categoryName);
        category.posts = category.posts.filter(p => !p.equals(post));
        this.categoryRepository.update(category);
        this.postService.removeCategory(post.uri, categoryName);
    }
}