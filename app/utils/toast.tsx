import { useEffect } from "react";
import { Toaster as Sonner, toast as showToast } from "sonner";

import { type Toast } from "#app/utils/toast.server";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ theme, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export const useToast = (toast: Toast | null) => {
  useEffect(() => {
    if (!toast) return;

    const toastTimer = setTimeout(() => {
      showToast[toast.type](toast.title, {
        id: toast.id,
        description: toast.description,
      });
    }, 0);

    return () => {
      clearTimeout(toastTimer);
    };
  }, [toast]);
};
