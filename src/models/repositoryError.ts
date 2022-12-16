class ItemExists extends Error {}

class ItemNotFound extends Error {}

export const RepositoryError = {
    ItemExists,
    ItemNotFound,
}