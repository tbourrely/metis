export type Routes = {
  version: string;
  resources: {
    [key: string]: string;
  };
  tags: { [key: string]: string };
};

export const routesV1: Routes = {
  version: 'v1',
  tags: { resources: 'Resources' },
  resources: {
    root: '/resources',
    delete: '/resources/:id',
    readermode: '/resources/:name/readermode',
  },
};
