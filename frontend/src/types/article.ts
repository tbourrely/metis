export type Article = {
  id: string
  name: string
  type: 'document' | string
  source: {
    name: string
    url: string
  }
  createdAt: string
}
