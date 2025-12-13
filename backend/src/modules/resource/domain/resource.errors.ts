export class ResourceAlreadyExistsError extends Error {
  constructor(resourceName: string) {
    super(`Resource with name "${resourceName}" already exists.`);
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resourceName: string) {
    super(`Resource with name "${resourceName}" does not exist.`);
  }
}

export class UnsupportedActionError extends Error {
  constructor(action: string) {
    super(`The action "${action}" is not supported on this resource.`);
  }
}
