import { ChangeEvent, watch as _watch } from 'turbowatch';

export interface ConfigurationInput {
  project: string;
  onChange: (event: ChangeEvent) => Promise<any>;
}

export const watch = ({ project, onChange }: ConfigurationInput) =>
  _watch({
    project,
    debounce: {
      wait: 500,
    },
    triggers: [
      {
        initialRun: false,
        expression: ['anyof', ['match', '**/src/**', 'wholename']],
        name: 'build',
        onChange,
      },
    ],
  });
