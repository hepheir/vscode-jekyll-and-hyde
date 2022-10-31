/**
 * Page specific information + the front matter.
 * Custom variables set via the front matter will be available here.
 */
export default interface Page {
    /**
     * The content of the Page,
     * rendered or un-rendered depending upon what Liquid is being processed and what page is.
     *
     * @type {string}
     */
    content: string;

    /**
     * The title of the Page.
     *
     * @type {string}
     */
    title: string;

    /**
     * The un-rendered excerpt of a document.
     *
     * @type {string}
     */
    excerpt: string;

    /**
     * The Date assigned to the Post.
     * This can be overridden in a Post’s front matter by specifying a new date/time in the format YYYY-MM-DD HH:MM:SS (assuming UTC),
     * or YYYY-MM-DD HH:MM:SS +/-TTTT (to specify a time zone using an offset from UTC. e.g. 2008-12-14 10:30:00 +0900).
     *
     * @type {string}
     */
    date: string;

    /**
     * The list of categories to which this post belongs.
     * Categories are derived from the directory structure above the `_posts` directory.
     * For example, a post at `/work/code/_posts/2008-12-24-closures.md` would have this field set to `['work', 'code']`.
     * These can also be specified in the front matter.
     *
     * @type {string[]}
     */
    categories: string[];

    /**
     * The path between the source directory and the file of the post or page, e.g. `/pages/`.
     * This can be overridden by `permalink` in the front matter.
     *
     * @type {string}
     */
    dir: string;

    /**
     * The filename of the post or page, e.g. `about.md`
     *
     * @type {string}
     */
    name: string;

    /**
     * The path to the raw post or page.
     * Example usage: Linking back to the page or post’s source on GitHub.
     * This can be overridden in the front matter.
     *
     * @type {string}
     */
    path: string;

    /**
     * Set to false if you don’t want a specific post to show up when the site is generated.
     * @type {boolean}
     */
    published: boolean;

    /**
     * Pages can have other properties
     */
    [key: string]: any;
}
