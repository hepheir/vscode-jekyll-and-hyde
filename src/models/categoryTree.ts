import Category from "./category";
import Page from "./page";

export default class CategoryTree {
    public static readonly instance: CategoryTree = new CategoryTree();

    private root: Category = new Category('.');

    private constructor() {
        this.addPost = this.addPost.bind(this);
    }

    makeTree(posts: Page[]) {
        this.root = new Category('.');
        for (const post of posts) {
            this.addPost(post);
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