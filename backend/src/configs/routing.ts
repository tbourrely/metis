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
    read: '/resources/:id',
    delete: '/resources/:id',
    update: '/resources/:id',
    readermode: '/resources/:id/readermode',
  },
};
