### Tumoral tissue classifier

## Requirements

To run this software you need

- Node js
- Python
- Java maven (build)
- Java jdk
- Spark

## Getting data from tgca

```sh
cd downloader
npm i 
npm i -g typescript
node ./build/index.js
```

## Prepare data for Spark (LIBSVM)

```sh
python adapter.py
```