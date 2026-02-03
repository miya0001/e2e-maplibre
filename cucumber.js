module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'support/**/*.ts',
      'features/step-definitions/**/*.ts'
    ],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true
  }
};
