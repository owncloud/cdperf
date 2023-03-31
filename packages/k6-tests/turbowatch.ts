import {watch} from "@ownclouders/turbowatch";

void watch({
  project: __dirname,
  onChange: async ({ spawn }) => {
    await spawn`pnpm run build:artifacts`
  },
});


