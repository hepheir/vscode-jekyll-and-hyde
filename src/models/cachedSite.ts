import { Site } from "jekyll";
import { Uri } from "vscode";


var cachedSite: Site;
var cachedSiteSourceUri: Uri;


export function setCachedSiteAndSource(site: Site, sourceUri: Uri) {
    setCachedSite(site);
    setCachedSourceUri(sourceUri);
}

export function setCachedSite(site: Site) {
    cachedSite = site;
}

export function setCachedSourceUri(sourceUri: Uri) {
    cachedSiteSourceUri = sourceUri;
}

export function getCachedSite(): Site | undefined {
    return cachedSite;
}

export function getCachedSiteSourceUri(): Uri | undefined {
    return cachedSiteSourceUri;
}
