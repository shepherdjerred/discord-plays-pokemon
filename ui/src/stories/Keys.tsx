import useKeyboardJs from "react-use/lib/useKeyboardJs";
import { Card } from "./Card";
import { Key } from "./Key";
import lodash from "lodash";

export function Keys() {
  const keys = ["a", "b", "left", "right", "up", "down", "enter", "shift"];
  const keyElements = lodash.map(keys, (key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isPressed] = useKeyboardJs(key);
    return (
      <div>
        <Key key={key} keycode={key} isPressed={isPressed} />
      </div>
    );
  });

  return <Card title="Keys">{keyElements}</Card>;
}
