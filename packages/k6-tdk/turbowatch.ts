import {watch} from "@ownclouders/turbowatch";

export default watch({
  project: __dirname,
  onChange: async ({ spawn }) => {
    await spawn`pnpm run build:artifacts`
    await spawn`pnpm run build:types`
  },
});


