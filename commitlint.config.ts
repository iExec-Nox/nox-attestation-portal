export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // nouvelle feature
        'fix', // correction de bug
        'chore', // maintenance, deps
        'docs', // documentation
        'style', // formatage, pas de logique
        'refactor', // refacto sans fix ni feature
        'test', // ajout ou modif de tests
        'perf', // amélioration performance
        'ci', // config CI/CD
        'revert', // revert d'un commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
  },
}
