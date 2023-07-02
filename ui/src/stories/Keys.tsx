import { Card } from "./Card";
import { Key } from "./Key";
import lodash from "lodash";

export function Keys({ onKey }: { onKey: (key: string) => void }) {
  const keys = ["a", "b", "left", "right", "up", "down", "enter", "shift"];
  const keyElements = lodash.map(keys, (key) => {
    return (
      <div>
        <Key key={key} keycode={key} onKey={() => onKey(key)} />
      </div>
    );
  });

  return <Card title="Keys">{keyElements}</Card>;
}
