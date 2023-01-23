import { Category } from "../model/category";
import { PageRepository } from "../model/page.repository";
import { Logger } from "../util/logger";

const logger = new Logger('command.reload');

export async function reload() {
    logger.info('clearing all categories.');
    Category.getRoot().children.clear();
    logger.info('reloading all pages.');
    PageRepository.instance.reload();
}