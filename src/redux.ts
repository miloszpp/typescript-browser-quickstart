// DeepReadonly

export type Primitive = string | number | boolean | undefined | null;
export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export type DeepReadonly<T> = T extends Primitive ? T : DeepReadonlyObject<T>;

type Person = DeepReadonly<{
  name: string;
  categories: string[];
  address: {
    city: string;
  };
}>;

declare const person: Person;

person.categories.push("abc");
person.categories = [];
person.address.city = "bbb";

// State

type State = DeepReadonly<{
  isFetching: boolean;
  data?: Person[];
  errorMessage?: string;
}>;

// Action creators

const fetch = () => ({ type: "fetch" } as const);
const success = (data: Person[]) =>
  ({ type: "success", payload: { data } } as const);
const failure = (error: string) =>
  ({ type: "failure", payload: { error } } as const);

const actions = { fetch, success, failure };

type ActionType<T> = {
  [P in keyof T]: T[P] extends (...args: any) => infer R ? R : never;
}[keyof T];

type Action = ActionType<typeof actions>;

// Reducer

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "fetch":
      return { isFetching: true };
    case "success":
      return { ...state, data: action.payload.data, isFetching: false };
    case "failure":
      return { ...state, isFetching: false };
  }
};
