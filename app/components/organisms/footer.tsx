export const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>
          &copy; {new Date().getFullYear()} Michal Kolacz. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
