import Category from "./category";
import Page from "./page";

export default class CategoryTree {
    private root: Category = new Category('.');

    constructor(posts?: Page[]) {
        this.addPost = this.addPost.bind(this);

        if (posts) {
            posts.forEach(this.addPost);
        }
    }

    addPost(post: Page) {
        let category: Category = this.root;
        for (const label of post.categories) {
            if (category.findCategoryByLabel(label) === undefined) {
                category.addCategory(new Category(label));
            }
            category = category.findCategoryByLabel(label)!;
        }
        category.addPost(post)
    }

    getRoot(): Category {
        return this.root;
    }
}