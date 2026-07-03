module.exports = {
  default: {
    require: ['features/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report.html',
      'json:cucumber-report.json',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
  },
}
