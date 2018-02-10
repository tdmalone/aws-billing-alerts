# AWS Billing Alerts

A simple [AWS Lambda](https://aws.amazon.com/lambda/) function that sends [SNS](https://aws.amazon.com/sns/) alerts when your current month's bill changes.

## Setup

Instructions coming soon, but briefly, you'll need to turn on billing alerts and set them to save to a bucket; create the Lambda function and build & upload or push the code; and create an SNS topic and set the topic ARN as the value for the environment variable `SNS_TOPIC` in your Lambda function config.

Your Lambda function role will need access to the S3 bucket your billing alerts are being saved to, and you'll need to set up an S3 trigger in the Lambda console to run your function on 'Object Created (All)' events in your bucket. If you're using the bucket for other things as well, set the prefix to `YOUR_AWS_ACCOUNT_ID-aws-billing-csv-` to avoid triggering the Lambda function needlessly.

More detailed instructions - or perhaps even a CloudFormation template or a shell script to set it all up - will be coming at some stage!

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
* Exclude bill events that are not for the current month
* Save reports and check if the price has changed since the last check
* Report exactly which line items changed
* Add a CloudFormation script - or a shell script running AWS CLI commands - to automate initial setup
* Move to a more scalable way of using [csv-parse](https://www.npmjs.com/package/csv-parse) - i.e. buffer the stream so the entire CSV doesn't sit in memory
* Write unit tests

## License

[MIT](LICENSE).
