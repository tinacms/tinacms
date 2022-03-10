import React, { createContext } from "react";
import type { TinaCollection, TinaField } from "tinacms";
import { Selector } from "../zeus";
import { Response } from "./util";

const localeStrings: TinaField[] = [
  {
    label: "Tel",
    name: "tel",
    type: "string",
  },
  {
    label: "Sign Up Link",
    name: "signUpLink",
    type: "string",
  },
  {
    label: "Sign Up Link Personal",
    name: "signUpLinkPersonal",
    type: "string",
  },
  {
    label: "Sign In Link",
    name: "signInLink",
    type: "string",
  },
];

export const localeCollection = (): TinaCollection => {
  return {
    label: "Locale Information",
    name: "localeInfo",
    path: "content/localeInfo",
    fields: [
      {
        type: "object",
        label: "AU",
        name: "au",
        fields: localeStrings,
      },
      {
        type: "object",
        label: "US",
        name: "us",
        fields: localeStrings,
      },
      {
        type: "object",
        label: "GB",
        name: "gb",
        fields: localeStrings,
      },
    ],
  };
};

const localeItems = {
  signInLink: true,
  signUpLink: true,
  signUpLinkPersonal: true,
  tel: true,
};

export const localeQuery = Selector("LocaleInfoDocument")({
  data: {
    au: localeItems,
    gb: localeItems,
    us: localeItems,
  },
});

export type LocaleType = Response<"LocaleInfoDocument", typeof localeQuery>;

export const LocaleContext = createContext<LocaleType["data"]["au"]>(null);

export const useLocaleInfo = () => {
  return React.useContext(LocaleContext);
};
