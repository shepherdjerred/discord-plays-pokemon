import { createGlobalStyle } from "styled-components";
import { GlobalStyles as BaseStyles } from "twin.macro";

const CustomStyles = createGlobalStyle({
  body: {},
});

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
);

export default GlobalStyles;
