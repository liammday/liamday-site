// Typed via the wrappers in src/data/*.ts; @rollup/plugin-yaml parses these.
declare module '*.yml' {
  const data: unknown;
  export default data;
}
declare module '*.yaml' {
  const data: unknown;
  export default data;
}
