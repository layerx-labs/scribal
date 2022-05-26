import { ElasticSearchConfig } from "index";

export default class ElasticSearch {
  constructor(
    private config: ElasticSearchConfig
  ) { }

  async send(options: { index: string, message?: string }) {
    const elastic = this.config?.client;

    if (!this.config || !elastic) {
      return console.info('ElastiSearch not properly configured');
    }

    const { index,  ...insertObj } = options;

    return await elastic.push(index, {
      createdAt: new Date().toISOString(),
      ...insertObj,
    });
  }
}