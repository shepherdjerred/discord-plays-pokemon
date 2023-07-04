import type { Preview } from "@storybook/react";
import "../src/index.css";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export const decorators = [(story) => <QueryClientProvider client={queryClient}>{story()}</QueryClientProvider>];

export default preview;
