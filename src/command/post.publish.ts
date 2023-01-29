import type { Page } from "../model/page";
import { FileSystem } from "../model/fs";
import { Logger } from "../util/logger";

const logger = new Logger('command.post.publish');

export async function publish(page: Page) {
    logger.info(`publish post : ${page}`);
    page.published = true;
    FileSystem.instance.write(page.resourceUri, await page.render());
}