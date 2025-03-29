import type { Meta, StoryObj } from "@storybook/react";

import { Login } from "./Login";

const meta = {
  title: "Login",
  component: Login,
  tags: ["autodocs"],
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleLogin: (token: string) => {
      console.log(token);
    },
  },
};
