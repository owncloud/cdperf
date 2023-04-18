import { ChangeEvent, watch as _watch } from 'turbowatch'

export interface ConfigurationInput {
  project: string;
  onChange: (event: ChangeEvent) => Promise<any>;
}

export const watch = ({ project, onChange }: ConfigurationInput) => {
  return _watch({
    project,
    debounce: {
      wait: 250
    },
    triggers: [
      {
        name: 'build',
        initialRun: false,
        expression: [
          'anyof',
          [
            'allof',
            ['dirname', 'node_modules'],
            ['dirname', 'dist'],
            ['match', '*', 'basename']
          ],
          [
            'allof',
            ['not', ['dirname', 'node_modules']],
            ['dirname', 'src'],
            ['match', '*', 'basename']
          ]
        ],
        onChange
      }
    ]
  })
}
