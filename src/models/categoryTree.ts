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
        this.findCategoryByPost(post).addPost(post);
    }

    findCategoryByPost(post: Page): Category {
        let category: Category = this.root;
        for (const label of post.categories) {
            category = category.findCategoryByLabel(label) ?? category.createSubcategory(label);
        }
        return category;
    }

    getRoot(): Category {
        return this.root;
    }
}