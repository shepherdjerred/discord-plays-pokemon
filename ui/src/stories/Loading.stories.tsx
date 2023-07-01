import type { Meta, StoryObj } from "@storybook/react";

import { LoadingSpinner } from "./LoadingSpinner";

const meta = {
  title: "LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "100px", height: "100px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
