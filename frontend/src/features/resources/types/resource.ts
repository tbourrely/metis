export type Resource = {
  id: string;
  name: string;
  type: "text" | "document";
  source: {
    name: string;
    url: string;
  };
  createdAt: string;
  read: boolean;
};
