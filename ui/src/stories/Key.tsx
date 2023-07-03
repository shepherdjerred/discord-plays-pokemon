import useKeyboardJs from "react-use/lib/useKeyboardJs";
import tw from "twin.macro";

export function Key({
  keycode: { display, key },
  onKey,
}: {
  keycode: { display: string; key: string };
  key: string;
  onKey: () => void;
}) {
  const [isPressed] = useKeyboardJs(key);
  if (isPressed) {
    onKey();
  }
  const pressedStyles = tw`bg-slate-400`;
  return <kbd css={[tw`p-3 bg-slate-600 block text-center m-1`, isPressed && pressedStyles]}>{display}</kbd>;
}
