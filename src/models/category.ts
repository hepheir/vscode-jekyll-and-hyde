import Page from "./page";

export default class Category {
    public readonly label: string;
    private readonly subcategories: Category[] = [];
    private readonly posts: Page[] = [];

    constructor(label: string) {
        this.label = label;
    }

    get children(): (Category | Page)[] {
        return [...this.subcategories, ...this.posts];
    }

    findCategoryByLabel(label: string): Category | undefined {
        return this.subcategories.find(category => category.label == label);
    }

    addCategory(category: Category) {
        this.subcategories.push(category);
        this.subcategories.sort(compareCategories);
    }

    addPost(post: Page) {
        this.posts.push(post);
        this.posts.sort(comparePosts);
    }
}

function compareCategories(prevCategory: Category, nextCategory: Category): number {
    return prevCategory.label.localeCompare(nextCategory.label);
}

function comparePosts(prevPost: Page, nextPost: Page): number {
    return prevPost.title.localeCompare(nextPost.title);
}