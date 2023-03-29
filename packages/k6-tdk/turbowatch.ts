import {watch} from "@ownclouders/turbowatch";

export default watch({
  project: __dirname,
  onChange: async ({ spawn }) => {
    await spawn`pnpm run build:esbuild`
    await spawn`pnpm run build:types`
  },
});


