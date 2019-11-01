// 1. Typing regular functions
// 2. Curried functions
// 3. Typing higher-order functions (map, filter, zip?)
// 4. Generic type argument propagation

const map = <T, R>(f: (el: T) => R) => (array: T[]) => array.map(f);

const prop = <K extends string, V>(name: K) => (obj: Record<K, V>) => obj[name];

const mapToNames = map(prop("name"));

// Exercise:
//
// Implement and type `pipe` function.
// const squareEvenNumbers = pipe(
//   filter((x: number) => x % 2 === 0),
//   map((x: number) => x * x)
// );
// squareEvenNumbers: (xs: number[]) => number[]

function pipe<T1, T2, R>(f1: (el: T1) => T2, f2: (el: T2) => R): (el: T1) => R;
function pipe<T1, T2, T3, R>(
  f1: (el: T1) => T2,
  f2: (el: T2) => T3,
  f3: (el: T3) => R
): (el: T1) => R;
function pipe(...fs: any[]) {
  return (arg: any) => fs.reduce((acc, f) => f(acc), arg);
}

export default {};
