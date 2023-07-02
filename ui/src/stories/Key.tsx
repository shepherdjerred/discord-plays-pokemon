import { useKeyPressEvent } from "react-use";
import useKeyboardJs from "react-use/lib/useKeyboardJs";
import tw from "twin.macro";

export function Key({ keycode, onKey }: { keycode: string; key: string; onKey: () => void }) {
  const [isPressed] = useKeyboardJs(keycode);
  useKeyPressEvent(keycode, () => onKey());
  const pressedStyles = tw`bg-slate-400`;
  return <kbd css={[tw`p-3 bg-slate-600 block text-center m-1`, isPressed && pressedStyles]}>{keycode}</kbd>;
}
