import Page from "../../models/page";

export type Category = string;
export type ExplorerTreeData = Page | Category;

export function isCategory(value: any): value is Category {
    return typeof value == "string";
}