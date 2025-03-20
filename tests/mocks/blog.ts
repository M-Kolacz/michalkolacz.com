import { faker } from "@faker-js/faker";

export const createBlogPost = () => {
  return {
    slug: faker.lorem.slug(),
    title: faker.lorem.sentence(),
    date: faker.date.past().toISOString(),
    excerpt: faker.lorem.paragraph(),
  };
};

export const createBlogPosts = (
  options: { min: number; max: number } = { min: 1, max: 10 }
) => {
  const postsNumber = faker.number.int(options);

  return Array.from({ length: postsNumber }, createBlogPost);
};
