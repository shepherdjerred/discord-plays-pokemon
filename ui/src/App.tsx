import tw from "twin.macro";
import IconAccessibility from "~icons/carbon/accessibility";
import IconAccountBox from "~icons/mdi/account-box";

const styles = {
  container: ({ hasBackground }: { hasBackground: boolean }) => [
    tw`flex flex-col items-center justify-center h-screen`,
    hasBackground && tw`bg-gradient-to-b`,
  ],
};

const App = () => (
  <div css={styles.container({ hasBackground: true })}>
    <div tw="flex flex-col justify-center h-full gap-y-5">
      <h1>Hello World</h1>
      <IconAccessibility />
      <IconAccountBox style={{ fontSize: "2em", color: "red" }} />
    </div>
  </div>
);

export default App;
