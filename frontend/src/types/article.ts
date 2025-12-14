export type Article = {
  id: string;
  name: string;
  type: string;
  source: {
    name: string;
    url: string;
  };
  createdAt: string;
};
