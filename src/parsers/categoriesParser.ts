import { Page } from "jekyll";

export type Categories = { [key: string]: Page[] };

export class CategoriesParser {
    static from(pages: Page[]): Categories {
        const categories: Categories = {};
        pages.forEach(p => p.categories.forEach(categoryName => {
            if (categoryName in categories) {
                categories[categoryName].push(p);
                return;
            }
            categories[categoryName] = [p];
        }));
        return categories;
    }
}
