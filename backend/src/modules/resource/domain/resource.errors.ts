export class ResourceAlreadyExistsError extends Error {
  constructor(resourceName: string) {
    super(`Resource with name "${resourceName}" already exists.`);
  }
}
