import { KeyboardKey } from "@discord-plays-pokemon/common";
import useKeyboardJs from "react-use/lib/useKeyboardJs";
import tw from "twin.macro";

export function Key({
  keyboardKey: { display, key, api },
  onKeyDown,
}: {
  keyboardKey: KeyboardKey;
  onKeyDown: () => void;
}) {
  const [isPressed, event] = useKeyboardJs(key);
  event?.preventDefault();
  if (isPressed) {
    onKeyDown();
  }
  const pressedStyles = tw`bg-slate-400`;
  return (
    <kbd css={[tw`p-3 bg-slate-600 block text-center m-1`, isPressed && pressedStyles]}>
      {display} ({api})
    </kbd>
  );
}
