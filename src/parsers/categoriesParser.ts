import { Page } from "jekyll";

export type Categories = { [key: string]: Page[] };

export class CategoriesParser {
    // Uses Zero-width space to distinguish uncategorized posts with posts in "Uncategorized"-category.
    public static readonly UNCATEGORIZED = '\u200BUncategorized';

    static from(pages: Page[]): Categories {
        const categories: Categories = {
            [this.UNCATEGORIZED]: [],
        };
        pages.forEach(p => {
            if (p.categories.length === 0) {
                categories[this.UNCATEGORIZED].push(p);
                return;
            }
            p.categories.forEach(categoryName => {
                if (categoryName in categories) {
                    categories[categoryName].push(p);
                    return;
                }
                categories[categoryName] = [p];
            });
        });
        return categories;
    }
}
