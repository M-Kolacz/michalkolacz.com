import { Link, type MetaFunction } from "react-router";

import meSrc from "#app/assets/me.avif?url";
import { Button, Icon } from "#app/components/atoms";

export const meta: MetaFunction = () => {
  return [
    { title: "michalkolacz.com" },
    { name: "description", content: "Welcome to michalkolacz.com!" },
  ];
};

export default function Index() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={meSrc}
              alt="Profile"
              width={128}
              height={128}
              className="object-center object-cover w-32 h-32"
            />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Michal Kolacz
            </h1>
            <h2 className="text-xl md:text-2xl text-[#0047AB] font-medium mb-6">
              Software Engineer
            </h2>
            <div className="flex space-x-4">
              <a
                href="https://github.com/M-Kolacz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#0047AB] transition-colors"
              >
                <Icon name="github" size="xl" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/m-kolacz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#0047AB] transition-colors"
              >
                <Icon name="linkedin" size="xl" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="https://x.com/M_Kolacz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#0047AB] transition-colors"
              >
                <Icon name="twitter" size="xl" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            Hey 👋 I`m software enginner who wants to share his knowledge and
            opinions about web development. I have a experience in creating
            products using React, Typescript and Node.js. Also I am big fan of
            Remix (currently React Router v7).
          </p>
        </div>
        <Link to="/blog">
          <Button className="mt-8">Check blog</Button>
        </Link>
      </div>
    </section>
  );
}
