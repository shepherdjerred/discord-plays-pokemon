import type { Meta, StoryObj } from "@storybook/react";

import { Profile } from "./Profile";

const meta = {
  title: "Profile",
  component: Profile,
  tags: ["autodocs"],
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    player: {
      discordId: "a",
      discordUsername: "person",
    },
  },
};
