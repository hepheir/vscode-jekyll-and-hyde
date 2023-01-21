import { Logger } from "../util/logger";
import { CategoriesView } from "../view/categories";

const logger = new Logger('command.refresh');

export async function refresh() {
    logger.info('refreshing.');
    CategoriesView.getInstance().update();
}