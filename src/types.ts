export type TSerializeOpts = {
  encode?: (uriComponent: string | number | boolean) => string;
  maxAge?: number;
  domain?: string;
  path?: string;
  expires?: Date | number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string | boolean;
};

export interface ISerialize {
  (name: string, val: string, opts?: TSerializeOpts): {
    str: string;
    obj: { [key: string]: string };
  };
}

export type TParseOpts = {
  decode?: (encodedURIComponent: string) => string;
};

export interface IParse {
  (str: string, opts?: TParseOpts): { [key: string]: any };
}

export type TJar = { [name: string]: any };
