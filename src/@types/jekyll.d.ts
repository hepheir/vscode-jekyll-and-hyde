declare module 'jekyll' {
    /**
     * Site wide information + configuration settings from `_config.yml`.
     */
    export interface Site {

        /**
         * The current time
         *
         * @type {Date}
         */
        readonly time: Date;

        /**
         * A list of all Pages.
         *
         * @type {Page[]}
         */
        readonly pages: Page[];

        /**
         * A reverse chronological list of all Posts.
         *
         * @type {Page[]}
         */
        readonly posts: Page[];

        /**
         * The list of all Posts in category `CATEGORY`.
         *
         * @type {{ [CATEGORY: string]: Page[] }}
         */
        readonly categories: { [CATEGORY: string]: Page[] };
    }


    /**
     * Page specific information + the front matter.
     * Custom variables set via the front matter will be available here.
     */
    export interface Page {

        /**
         * The content of the Page,
         * rendered or un-rendered depending upon what Liquid is being processed and what page is.
         *
         * @type {string}
         */
        readonly content: string;

        /**
         * The title of the Page.
         *
         * @type {string}
         */
        readonly title: string;

        /**
         * The un-rendered excerpt of a document.
         *
         * @type {string}
         */
        readonly excerpt: string;

        /**
         * The Date assigned to the Post.
         * This can be overridden in a Post’s front matter by specifying a new date/time in the format YYYY-MM-DD HH:MM:SS (assuming UTC),
         * or YYYY-MM-DD HH:MM:SS +/-TTTT (to specify a time zone using an offset from UTC. e.g. 2008-12-14 10:30:00 +0900).
         *
         * @type {Date}
         */
        readonly date: Date;

        /**
         * The list of categories to which this post belongs.
         * Categories are derived from the directory structure above the `_posts` directory.
         * For example, a post at `/work/code/_posts/2008-12-24-closures.md` would have this field set to `['work', 'code']`.
         * These can also be specified in the front matter.
         *
         * @type {string[]}
         */
        readonly categories: string[];

        /**
         * The path between the source directory and the file of the post or page, e.g. `/pages/`.
         * This can be overridden by `permalink` in the front matter.
         *
         * @type {string}
         */
        readonly dir: string;

        /**
         * The filename of the post or page, e.g. `about.md`
         *
         * @type {string}
         */
        readonly name: string;

        /**
         * The path to the raw post or page.
         * Example usage: Linking back to the page or post’s source on GitHub.
         * This can be overridden in the front matter.
         *
         * @type {string}
         */
        readonly path: string;
    }


    /**
     * Any file that contains a YAML front matter block will be processed by Jekyll as a special file.
     * The front matter must be the first thing in the file and must take the form of valid YAML set between triple-dashed lines.
     * Here is a basic example:
     *
     * ```yaml
     * ---
     * layout: post
     * title: Blogging Like a Hacker
     * ---
     * ```
     *
     * Between these triple-dashed lines,
     * you can set predefined variables (see below for a reference) or even create custom ones of your own.
     * These variables will then be available for you to access using Liquid tags both further down in the file and also in any layouts or includes that the page or post in question relies on.
     */
    export interface FrontMatter {
        // Predefined Global VariablesPermalink

        /**
         * If set, this specifies the layout file to use.
         * Use the layout file name without the file extension
         * Layout files must be placed in the `_layouts` directory.
         *
         * * Using `null` will produce a file without using a layout file.
         *   This is overridden if the file is a post/document and has a layout defined in the front matter defaults.
         *
         * * Starting from version 3.5.0,
         *   using `none` in a post/document will produce a file without using a layout file regardless of front matter defaults.
         *   Using `none` in a page will cause Jekyll to attempt to use a layout named "none".
         *
         * @type {string | null | undefined}
         */
        readonly layout: string | null | undefined;

        /**
         * If you need your processed blog post URLs to be something other than the site-wide style (default `/year/month/day/title.html`),
         * then you can set this variable and it will be used as the final URL.
         *
         * @type {string | undefined}
         */
        readonly permalink: string | undefined;

        /**
         * Set to false if you don’t want a specific post to show up when the site is generated.
         *
         * @type {boolean | undefined}
         */
        readonly published: boolean | undefined;

        // Predefined Variables for PostsPermalink

        /**
         * A date here overrides the date from the name of the post.
         * This can be used to ensure correct sorting of posts.
         * A date is specified in the format `YYYY-MM-DD HH:MM:SS +/-TTTT`; hours, minutes, seconds, and timezone offset are optional.
         *
         * @type {string | undefined}
         */
         readonly date: string | undefined;

        /**
         * Instead of placing posts inside of folders,
         * you can specify one or more categories that the post belongs to.
         * When the site is generated the post will act as though it had been set with these categories normally.
         * Categories (plural key) can be specified as a YAML list or a space-separated string.
         *
         * @type {string | undefined}
         */
        readonly category: string | undefined;

        /**
         * Instead of placing posts inside of folders,
         * you can specify one or more categories that the post belongs to.
         * When the site is generated the post will act as though it had been set with these categories normally.
         * Categories (plural key) can be specified as a YAML list or a space-separated string.
         *
         * @type {string[] | undefined}
         */
        readonly categories: string[] | undefined;

        /**
         * Similar to categories, one or multiple tags can be added to a post.
         * Also like categories, tags can be specified as a YAML list or a space-separated string.
         *
         * @type {string[] | undefined}
         */
        readonly tags: string[] | undefined;

        // Others

        readonly title: string | undefined;
    }
}
