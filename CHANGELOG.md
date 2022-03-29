# Change Log

<!--
All notable changes to the "jekyll-n-hyde" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.
-->

## [Unreleased]

## [0.0.1] - 2022-03-22
### Added
- [views] **"Jekyll Explorer"** (`jekyll-enthusiasm.jekyllExplorer`): Tree view for your pages/posts/drafts
- [commands] **"Open Text Document"** (`jekyll-n-hyde.jekyllExplorer.openTextDocument`)

## [0.1.0] - 2022-03-24
### Added
- [views] **"Categorized Posts"** (`categoryView`): shows posts and drafts grouped by categories.
- [views] **"All Drafts"** (`draftView`): shows all markdowns in the `_drafts` directory.
- [views] **"All Posts"** (`pageView`): shows all markdowns in the `_posts` directory.
- [views] **"All Pages"** (`postView`): shows all markdowns in the `_pages` directory.
- [commands] **"Update cache and refresh views."** (`refresh`)
- [others] **"Auto Refreshing"**: Changing a text document will refresh views.

### Changed
- [commands] **"Open Text Document"** (`jekyll-n-hyde.jekyllExplorer.openTextDocument`): change `id` of the command from `jekyll-n-hyde.jekyllExplorer.openTextDocument` to `showTextDocument`.

### Removed
- [views] **"Jekyll Explorer"** (`jekyll-enthusiasm.jekyllExplorer`)

## [0.1.1] - 2022-03-24
### Added
- [others] **"Sort Category in order"**: Categorized Posts are now sorted in alphabetic order.

### Changed
- [others] **"Auto Refreshing"**: ~~Changing~~ **Saving** a text document will refresh views.

## [0.1.2] - 2022-03-24
### Changed
- [menus] **"Refresh"** (`refresh`): use when clause to hide refresh button on other views.

## [0.2.0] - 2022-03-29
### Added
- [views] **"Categorized Posts"** (`categorizedPosts`):
- [commands] **"Categorized Posts"**

### Removed
- [views] **"Categorized Posts"** (`categoryView`): removed
- [views] **"All Drafts"** (`draftView`): removed
- [views] **"All Posts"** (`pageView`): removed
- [views] **"All Pages"** (`postView`): removed
- [commands] **"Update cache and refresh views."** (`refresh`): removed

## [0.2.1] - 2022-03-29
### Fixed
- [views] **"Categorized Posts"** (`categoryView`): a few categories were not rendered properly caused by sorting failure

[Unreleased]: https://github.com/hepheir/vscode-jekyll-n-hyde/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/hepheir/vscode-jekyll-n-hyde/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/hepheir/vscode-jekyll-n-hyde/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/hepheir/vscode-jekyll-n-hyde/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/hepheir/vscode-jekyll-n-hyde/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/hepheir/vscode-jekyll-n-hyde/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/hepheir/vscode-jekyll-n-hyde/releases/tag/v0.0.1
