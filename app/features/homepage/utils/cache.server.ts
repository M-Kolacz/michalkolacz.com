import NodeCache from "node-cache";

export const blogCache = new NodeCache({ stdTTL: 0 });
