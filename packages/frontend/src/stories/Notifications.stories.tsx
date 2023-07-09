import type { Meta, StoryObj } from "@storybook/react";

import { Notifications } from "./Notifications";

const meta = {
  title: "Notifications",
  component: Notifications,
  tags: ["autodocs"],
} satisfies Meta<typeof Notifications>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    notifications: [{ title: "", id: "", level: "Info", message: "" }],
  },
};
