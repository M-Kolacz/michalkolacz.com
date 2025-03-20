import { Header, Footer } from "#app/components/organisms";

export const layoutDecorator = (Story: React.FC) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Story />
      </main>
      <Footer />
    </div>
  );
};
