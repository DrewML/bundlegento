# Contributing to bundlegento

Contributions can take the form of new features, changes to existing features, tests, documentation, bug fixes, optimizations, etc.

The Magento 2 development team will review all issues and contributions submitted by the community of developers in the first in, first out order. During the review we might require clarifications from the contributor. If there is no response from the contributor within two weeks, the pull request will be closed.

## Contribution requirements

1. Pull requests (PRs) must be accompanied by a meaningful description of their purpose. Comprehensive descriptions increase the chances of a pull request being merged quickly and without additional clarification requests.
1. Commits must be accompanied by meaningful commit messages.
1. PRs which include bug fixes must be accompanied with a step-by-step description of how to reproduce the bug.
1. PRs which include new logic or new features must be submitted along with tests and documentation
1. For larger features or changes, please [open an issue](https://github.com/magento/bundlegento/issues) to discuss the proposed changes prior to development. This may prevent duplicate or unnecessary effort and allow other contributors to provide input.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. We expect you to agree to its terms when participating in this project.
The full text is available in the repository [Wiki](https://github.com/magento/magento2/wiki/Magento-Code-of-Conduct).

## Writing Tests

The following guidelines should be followed when writing tests:

1. Fast tests should be named `{filename}.unit.js`
2. Slow tests should be named `{filename}.int.js`
