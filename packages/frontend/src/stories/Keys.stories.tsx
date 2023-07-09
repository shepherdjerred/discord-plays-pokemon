import type { Meta, StoryObj } from "@storybook/react";

import { Keys } from "./Keys";

const meta = {
  title: "Keys",
  component: Keys,
  tags: ["autodocs"],
} satisfies Meta<typeof Keys>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
