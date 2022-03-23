import { Site } from "jekyll";
import { ExtensionContext } from "vscode";
import { CategoryNode } from "./categoryNode";
import { DraftNode } from "./draftNode";
import { PageNode } from "./pageNode";
import { PostNode } from "./postNode";


export class CachedNodes {
    static categoryNodes: CategoryNode[] = [];
    static pageNodes: PageNode[] = [];
    static postNodes: PostNode[] = [];
    static draftNodes: DraftNode[] = [];

    static cache(context: ExtensionContext, site: Site) {
        CachedNodes.pageNodes = site.pages.map(p => new PageNode(context, p));
        CachedNodes.categoryNodes = Object.entries(site.categories).map((category) => {
            const [label, pages] = category;
            const posts = pages.filter(p => p.dir.startsWith('_posts'));
            const drafts = pages.filter(p => p.dir.startsWith('_drafts'));
            return new CategoryNode(context, label, posts.length, drafts.length);
        });

        CachedNodes.draftNodes = site.posts.filter(p => p.dir.startsWith('_drafts')).map(p => new DraftNode(context, p));
        CachedNodes.postNodes = site.posts.filter(p => p.dir.startsWith('_posts')).map(p => new PostNode(context, p));
    }
}
