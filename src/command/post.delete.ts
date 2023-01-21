import type { Page } from "../model/page";
import { FileSystem } from "../model/fs";
import { Logger } from "../util/logger";

const logger = new Logger('command.post.delete');

export async function delete_(page: Page) {
    logger.info(`deleting post : ${page}`);
    FileSystem.instance.delete(page.resourceUri);
}