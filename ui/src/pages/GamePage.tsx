import { Avatar } from "../stories/Avatar";
import { Button } from "../stories/Button";
import { Card } from "../stories/Card";
import { Controls } from "../stories/Controls";
import { Keys } from "../stories/Keys";
import { Profile } from "../stories/Profile";

export function GamePage() {
  const period = 60;
  const players = 3;
  return (
    <>
      <Card title="Status">
        <div>There are {players} others connected</div>
        <div>You've used up 57% of your commands</div>
        <div>Your ping is 53ms</div>
      </Card>
      <Profile />
      <Keys />
      <Controls period={period} players={players} />
      <Button>Take Screenshot</Button>
    </>
  );
}
