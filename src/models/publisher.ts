import * as path from "path";
import * as vscode from "vscode";
import { Page } from "jekyll";
import { PageParser } from "../parsers/pageParser";


export class Publisher {
    private static readonly FORMAT_REGEXP = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-.+\.(md)|(markdown)$/;
    private static readonly DRAFT_DIR = '_drafts';
    private static readonly POST_DIR = '_posts';

    /**
     * Publish a draft.
     *
     * The draft will be renamed and moved from _drafts/ to _posts/.
     * If basename of the draft does not include date string `YYYY-MM-DD`,
     * date string will be formed and prepended.
     *
     * @param {Page} draft draft to publish
     * @returns {vscode.Uri} Uri of published post
     */
    public static async publish(draft: Page): Promise<vscode.Uri> {
        const draftUri = vscode.Uri.file(draft.path);
        if (!PageParser.isDraft(draftUri)) {
            vscode.window.showWarningMessage(`"${draft.title}" is not a draft.`);
            return draftUri;
        }
        const postUri = this.isValidPostFileFormat(draftUri)
            ? this.draftToPost(draftUri)
            : this.draftToPost(this.fixPostFileFormat(draftUri, draft.date));
        await vscode.workspace.fs.rename(draftUri, postUri, { overwrite: false });
        return postUri;
    }

    /**
     * Unpublish a post.
     *
     * The post will moved from _posts/ to _drafts/.
     *
     * @param post post to unpublish
     * @returns Uri of unpublished post
     */
    public static async unpublish(post: Page): Promise<vscode.Uri> {
        const postUri = vscode.Uri.file(post.path);
        if (!PageParser.isPost(postUri)) {
            vscode.window.showWarningMessage(`"${post.title}" is not a post.`);
            return postUri;
        }
        const draftUri = this.postToDraft(postUri);
        await vscode.workspace.fs.rename(postUri, draftUri, { overwrite: false });
        return draftUri;
    }

    /**
     * Format the basename of given uri into following pattern:
     * ```text
     * YEAR-MONTH-DAY-title.MARKUP
     * ```
     *
     * @param uri uri of file to fix.
     * @param date
     *  `Date` object used to generate year, month, and date.
     *  If `date` is not given or invalid, `date` will be replaced with `new Date()`.
     * @returns Uri of the formatted file.
     */
    public static fixPostFileFormat(uri: vscode.Uri, date?: Date): vscode.Uri {
        const fixedBasename = [this.createDateFormat(date), path.basename(uri.path)].join('-');
        const fixedUri = vscode.Uri.file(path.join(path.dirname(uri.path), fixedBasename));
        return fixedUri;
    }

    /**
     * Create date format of `YYYY-MM-DD` pattern.
     *
     * @param date
     *  `Date` object used to generate year, month, and date.
     *  If `date` is not given or invalid, `date` will be replaced with `new Date()`.
     * @returns
     */
    public static createDateFormat(date?: Date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            date = new Date();
        }
        return [
            (date!.getFullYear()).toString().padStart(4, '0'),
            (date!.getMonth() + 1).toString().padStart(2, '0'),
            (date!.getDate()).toString().padStart(2, '0'),
        ].join('-');
    }

    private static draftToPost(uri: vscode.Uri): vscode.Uri {
        const workspaceFolderUri = vscode.workspace.getWorkspaceFolder(uri)!.uri;
        const draftRelPath = vscode.workspace.asRelativePath(uri);
        const postRelPath = draftRelPath.replace(this.DRAFT_DIR, this.POST_DIR);
        return vscode.Uri.joinPath(workspaceFolderUri, postRelPath);
    }

    private static postToDraft(uri: vscode.Uri): vscode.Uri {
        const workspaceFolderUri = vscode.workspace.getWorkspaceFolder(uri)!.uri;
        const postRelPath = vscode.workspace.asRelativePath(uri);
        const draftRelPath = postRelPath.replace(this.POST_DIR, this.DRAFT_DIR);
        return vscode.Uri.joinPath(workspaceFolderUri, draftRelPath);
    }

    private static isValidPostFileFormat(uri: vscode.Uri): boolean {
        const basename = path.basename(uri.path);
        return this.FORMAT_REGEXP.test(basename);
    }
}
