import "../styles.css";
import TinaProvider from "../.tina/components/TinaDynamicProvider";

const App = ({ Component, pageProps }) => {
  return (
    <TinaProvider>
      <Component {...pageProps} />
    </TinaProvider>
  );
};

export default App;
