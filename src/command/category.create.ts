import { Category } from "../model/category";
import { CategoriesView } from "../view/categories";
import { promptViaInputBox } from "../util/io";
import { Logger } from "../util/logger";

const logger = new Logger('command.category.create');

export async function create(category: Category | undefined = undefined) {
    const parentCategory = category ?? Category.getRoot();
    const categoriesView = CategoriesView.getInstance();
    logger.info(`creating category under ${parentCategory}`);
    const name = await promptViaInputBox({
        title: 'Create a new category',
        prompt: 'Enter the name of the category',
    });
    const subcategory = parentCategory.createSubcategory(name);
    categoriesView.update([category ?? subcategory, subcategory]);
    categoriesView.view.reveal(subcategory);
    logger.info(`successfully created category ${subcategory}.`);
}