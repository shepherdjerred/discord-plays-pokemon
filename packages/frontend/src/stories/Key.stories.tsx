import type { Meta, StoryObj } from "@storybook/react";

import { Key } from "./Key";

const meta = {
  title: "Key",
  component: Key,
  tags: ["autodocs"],
} satisfies Meta<typeof Key>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    keyboardKey: { display: "A", api: "a", key: "a" },
    onKeyDown: () => undefined,
  },
};
