import type { Page } from "../model/page";
import { FileSystem } from "../model/fs";
import { Logger } from "../util/logger";

const logger = new Logger('command.post.date-up-to-date');

export async function dateUpToDate(page: Page) {
    logger.info(`make post date up to date : ${page}`);
    page.setDate(new Date());
    FileSystem.instance.write(page.resourceUri, await page.render());
}