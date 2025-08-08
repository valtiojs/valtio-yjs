# Change Log

## [Unreleased]

## [0.6.4] - 2025-08-09

### Changed

- fix toYValue throws error for undefined #58

## [0.6.3] - 2025-08-08

### Changed

- fix proxy re-assign from Y.Map observe #57

## [0.6.2] - 2025-08-06

### Changed

- fix: toYValue should throw for nested non-serializable value #54

## [0.6.1] - 2025-06-19

### Changed

- Fix: support mutation on the length property directly to shrink or extend arrays #51

## [0.6.0] - 2024-06-04

### Changed

- Module-first setup #48

## [0.5.1] - 2023-12-02

### Changed

- fix: guard against deleted parent and child #42

## [0.5.0] - 2023-02-14

### Added

- refactor to use root level subscriptions #37

## [0.4.1] - 2023-01-29

### Changed

- Use ymap value on nested map bind initialization #36

## [0.4.0] - 2022-10-07

### Changed

- refactor: use bind api #34
  - [BREAKING CHANGE] `bindProxyAndYMap` and `bindProxyAndYArray` are combined to `bind`.

## [0.3.1] - 2022-02-14

### Changed

- Skip non-proxy objects and only warn the usage (#23)

## [0.3.0] - 2022-01-06

### Changed

- Pass transactionOrigin function through without calling it (#19)

## [0.2.0] - 2021-12-17

### Changed

- Allow variable transactionOrigin value (#18)

## [0.1.7] - 2021-12-13

### Changed

- fix: swapping array items (#8)

## [0.1.6] - 2021-11-29

### Changed

- Fix infinite loop when replacing an array inside a nested map (#16)

## [0.1.5] - 2021-11-28

### Changed

- Support nested map set (#15)

## [0.1.4] - 2021-11-23

### Changed

- Add support for transactionOrigin (#13)

## [0.1.3] - 2021-11-02

### Changed

- fix: initializing array with primitive values (#12)

## [0.1.2] - 2021-10-05

### Changed

- fix: null values in object (#10)

## [0.1.1] - 2021-08-18

### Changed

- fix: initializing array (#5)

## [0.1.0] - 2021-07-25

### Added

- Initial alpha release
