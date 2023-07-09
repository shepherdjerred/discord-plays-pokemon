import type { Meta, StoryObj } from "@storybook/react";

import { Notification } from "./Notification";

const meta = {
  title: "Notification",
  component: Notification,
  tags: ["autodocs"],
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
