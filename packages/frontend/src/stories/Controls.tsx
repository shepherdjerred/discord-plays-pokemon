import { Card } from "./Card";

export function Controls({ players, period }: { players: number; period: number }) {
  return (
    <Card title="Controls">
      Use the arrow keys or WASD to move around. A and B act as A and B in-game. Press ENTER for start, or SHIFT for
      select.
      <div>
        You can issue 1/{players} of the commands within a {period} second period. If you issue more than 1/{players} of
        the commands in a 60s period, your commands may be pre-empted by another person who has issued fewer commands
        than you. Otherwise, your commands will be executed without interruption.
      </div>
    </Card>
  );
}
