export type Routes = {
  version: string;
  resources: {
    [key: string]: string;
  };
  tags: { [key: string]: string };
  imports: { [key: string]: string };
};

export const routesV1: Routes = {
  version: 'v1',
  tags: { resources: 'Resources', imports: 'Imports' },
  resources: {
    root: '/resources',
    read: '/resources/:id',
    delete: '/resources/:id',
    update: '/resources/:id',
    readermode: '/resources/:id/readermode',
  },
  imports: {
    root: '/import',
  },
};
