import type { Page } from "../model/page";
import { FileSystem } from "../model/fs";
import { Logger } from "../util/logger";

const logger = new Logger('command.post.unpublish');

export async function unpublish(page: Page) {
    logger.info(`unpublish post : ${page}`);
    page.published = false;
    FileSystem.instance.write(page.resourceUri, await page.render());
}