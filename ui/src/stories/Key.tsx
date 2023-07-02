import tw from "twin.macro";

export function Key({ isPressed, keycode }: { isPressed: boolean; keycode: string; key: string }) {
  const pressedStyles = tw`bg-slate-400`;
  return <kbd css={[tw`p-3 bg-slate-600 block text-center m-1`, isPressed && pressedStyles]}>{keycode}</kbd>;
}
