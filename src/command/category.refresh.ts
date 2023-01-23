import { Category } from "../model/category";
import { Logger } from "../util/logger";
import { CategoriesView } from "../view/categories";

const logger = new Logger('command.category.refresh');

export async function refresh(category: Category) {
    logger.info('refreshing.');
    CategoriesView.getInstance().update(category);
}