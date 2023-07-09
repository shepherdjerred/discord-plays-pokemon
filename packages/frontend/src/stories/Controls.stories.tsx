import type { Meta, StoryObj } from "@storybook/react";

import { Controls } from "./Controls";

const meta = {
  title: "Controls",
  component: Controls,
  tags: ["autodocs"],
} satisfies Meta<typeof Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
