# AWS Billing Alerts

A simple [AWS Lambda](https://aws.amazon.com/lambda/) function that sends [SNS](https://aws.amazon.com/sns/) alerts when your current month's bill changes.

## Setup

Instructions coming soon, but briefly, you'll need to turn on billing alerts and set them to save to a bucket; create the Lambda function and build & upload or push the code; and create an SNS topic and set the topic ARN as an environment variable.

## Tests

To run all tests at once:

    yarn test

### Unit Tests

To run:

    yarn unit-tests

Unit tests are yet to be written, and will currently just pass.

### Integration Tests

To run:

    yarn docker-tests

Integration tests require [Docker](https://docs.docker.com/install/). They run in `lambci/lambda:nodejs6.10` ([GitHub](https://github.com/lambci/docker-lambda) | [Docker Hub](https://hub.docker.com/r/lambci/lambda/)).

The following environment variables must be defined on your system:

* `SNS_TOPIC`
* `BUCKET_NAME`
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_DEFAULT_REGION`

## TODO

* Add full setup instructions
* Add a CloudFormation script - or a shell script running AWS CLI commands - to automate initial setup
* Move to a more scalable way of using [csv-parse](https://www.npmjs.com/package/csv-parse) - i.e. buffer the stream so the entire CSV doesn't sit in memory
* Write unit tests
* Add configurable S3 bucket name and file name for integration tests, so it's not limited to what I have set up - plus make it choose the current month?

## License

[MIT](LICENSE).
