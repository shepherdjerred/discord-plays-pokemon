import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Card } from "./Card";

export function Profile() {
  return (
    <Card title="Profile">
      <Avatar />
      <p>Logged in as Jerred</p>
      <Button>Logout</Button>
    </Card>
  );
}
