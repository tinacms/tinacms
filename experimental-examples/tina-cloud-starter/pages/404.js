import { Hero } from "../components/blocks/hero";

export default function FourOhFour() {
  return (
    <Hero
      data={{
        color: "default",
        headline: "404 – Page Not Found",
        text: "Oops! It seems there's nothing here, how embarrassing.",
        actions: [
          {
            label: "Return Home",
            type: "button",
            icon: true,
            link: "/",
          },
        ],
      }}
    />
  );
}
