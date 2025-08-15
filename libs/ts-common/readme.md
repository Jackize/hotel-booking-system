# ts-common

Common utility library for Node.js projects including:

- Logger (Pino-based)
- Kafka wrapper (KafkaJS-based)
- TypeORM helper

---

## Table of Contents

- [Installation](#installation)  
- [Build](#build)  
- [Usage](#usage)  
  - [Logger](#logger)  
  - [Kafka Wrapper](#kafka-wrapper)  
  - [TypeORM Helper](#typeorm-helper)  
- [Publishing Locally](#publishing-locally)  
- [Contributing](#contributing)  

---

## Installation

You can install the package locally by downloading the tarball or referencing the package path:

```bash
npm install /path/to/ts-common-1.0.0.tgz
```

## Build

To build the library (transpile TypeScript to JavaScript):

```bash
npm run build
```

## Usage

Import and use the utilities in your service projects:


## Logger

```bash
import logger from "ts-common/dist/logger";

logger.info("Application started");
logger.error(new Error("Something went wrong"));
```

## Kafka Wrapper

```bash
import kafkaWrapper from "ts-common/dist/kafka";

const kafka = new KafkaWrapper(["localhost:9092"]);

async function run() {
    await kafka.connect();
    await kafka.sendMessage("my-topic", [
        { key: "key1", value: JSON.stringify({data: "value" })},
    ])
}

run()
```

## TypeORM Helper

```bash
import { createDataSource } from "ts-common/dist/typeorm-helper";

const dataSource = createDataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "hotel",
    entities: [__dirname + "/entity/*.ts"],
    synchronize: true,
})

await dataSource.initialize();
```

## Publishing Locally

1. In libs/ts-common directory, run:

```bash
npm pack
```

2. This creates a ".tgz" package file, e.g. "ts-common-1.0.0.tgz"

3. In your project where you want to use the library, run:

```bash
npm i /full/path/to/ts-common-1.0.0.tgz
```

4. Then import and use as show above.

## Contributing

Feel free to submit issues or pull requests to improve this library