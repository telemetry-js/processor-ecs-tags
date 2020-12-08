# processor-ecs-tags

> **Add `cluster`, `region`, `name` and `image` tags to metrics. Fetched from ECS Task Metadata Endpoint [V2](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v2.html) or [V3](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v3.html). Only works in an ECS container.**  
> A [`telemetry`](https://github.com/telemetry-js/telemetry) plugin.

[![npm status](http://img.shields.io/npm/v/telemetry-js/processor-ecs-tags.svg)](https://www.npmjs.org/package/@telemetry-js/processor-ecs-tags)
[![node](https://img.shields.io/node/v/@telemetry-js/processor-ecs-tags.svg)](https://www.npmjs.org/package/@telemetry-js/processor-ecs-tags)
[![Test](https://github.com/telemetry-js/processor-ecs-tags/workflows/Test/badge.svg?branch=main)](https://github.com/telemetry-js/processor-ecs-tags/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

<details><summary>Click to expand</summary>

- [Usage](#usage)
- [Options](#options)
- [Install](#install)
- [Acknowledgements](#acknowledgements)
- [License](#license)

</details>

## Usage

```js
const telemetry = require('@telemetry-js/telemetry')()
const tags = require('@telemetry-js/processor-ecs-tags')

telemetry.task()
  .process(tags, { version: 2 })
```

## Options

- `version`: required, number, either 2 or 3. Must be 2 when you're using a Fargate cluster; Fargate does not support v3.

## Install

With [npm](https://npmjs.org) do:

```
npm install @telemetry-js/processor-ecs-tags
```

## Acknowledgements

This project is kindly sponsored by [Reason Cybersecurity Inc](https://reasonsecurity.com).

[![reason logo](https://cdn.reasonsecurity.com/github-assets/reason_signature_logo.png)](https://reasonsecurity.com)

## License

[MIT](LICENSE) © Vincent Weevers
