/**
 * A simple AWS Lambda function that sends SNS alerts when your current month's bill changes.
 *
 * @author Tim Malone <tdmalone@gmail.com>
 */

'use strict';

const aws = require( 'aws-sdk' ),
      parseCsv = require( 'csv-parse/lib/sync' );

/* eslint-disable no-process-env */
const SNS_TOPIC = process.env.SNS_TOPIC,
      BUCKET_NAME = process.env.BUCKET_NAME,
      TESTING = process.env.TESTING;
/* eslint-disable no-process-env */

const FIRST_ITEM = 0,
      ONLY_ITEM = 0,
      MAKE_1_BASED = 1,
      SECOND_LAST_LINE = -2,
      LAST_LINE = -1;

const s3 = new aws.S3();

exports.handler = ( event, context, callback ) => {

  getS3Params( event )
    .then( getBillingData )
    .then( processBillingData )
    .then( maybeSendMessage )
    .then( ( result ) => {
      callback( null, result );
    })
    .catch( ( error ) => {
      callback( error );
    });

}; // Module.exports.

/**
 * Processes a single property from incoming event data to determine if we should modify it. This
 * is primarily used for testing purposes only, as in a live environment we simply use the real
 * event data we are given.
 *
 * @param {string} data An event data property to process.
 */
function getS3Params( event ) {
  return new Promise( ( resolve, reject ) => {

    // If we're not in testing mode, we can return immediately with the given event data.
    if ( ! TESTING ) {

      resolve({
        Bucket: event.Records[ FIRST_ITEM ].s3.bucket.name,
        Key:    event.Records[ FIRST_ITEM ].s3.object.key
      });

      return;

    }

    // Get the user's AWS account ID, which makes up part of the object key we need to retrieve.
    const sts = new aws.STS();
    sts.getCallerIdentity({}, ( error, data ) => {

      if ( error ) {
        reject( error );
        return;
      }

      const awsAccountId = data.Account,
            currentDate = new Date();

      resolve({

        Bucket: event.Records[ FIRST_ITEM ].s3.bucket.name
          .replace( '{BUCKET_NAME}', BUCKET_NAME ),

        Key: event.Records[ FIRST_ITEM ].s3.object.key
          .replace( '{CURRENT_YEAR}', currentDate.getFullYear() )
          .replace( '{CURRENT_MONTH}', padTo2Digits( currentDate.getMonth() + MAKE_1_BASED ) )
          .replace( '{AWS_ACCOUNT_ID}', awsAccountId )

      }); // Resolve.
    }); // Sts.getCallerIdentity.
  }); // Return new Promise.
} // Function processEventData.

/**
 * Retrieves billing data from S3, as saved by AWS Billing.
 */
function getBillingData( params ) {
  return new Promise( ( resolve, reject ) => {

    // TODO: Reject and quit now if params.Key doesn't match the bill for the current month.
    // \d+-aws-billing-csv-\d{4}-\d{2}.csv

    console.log( params );

    // Get current monthly bill amount.
    s3.getObject( params, ( error, data ) => {

      if ( error ) {
        reject( error );
        return;
      }

      resolve( data );

    }); // S3.getObject.
  }); // Return new Promise.
} // Function getBillingData.

/**
 * Processes billing data to gather just what we need.
 */
function processBillingData( data ) {
  return new Promise( ( resolve ) => {

    const csvData = parseCsv( data.Body.toString() );

    // Second last line, immediately before the disclaimer.
    const billingLineTotal = csvData.slice( SECOND_LAST_LINE, LAST_LINE )[ ONLY_ITEM ];

    // The current price of the bill.
    const totalPrice = billingLineTotal.pop();

    resolve( totalPrice );

  }); // Return new Promise.
} // Function processBillingData.

/**
 * Determines whether or not to send a notification message (well, at least, it *will* determine -
 * currently it just sends it no matter what ;) ).
 */
function maybeSendMessage( totalPrice ) {
  return new Promise( ( resolve, reject ) => {

    // TODO: Check if the price has changed since the last report was duplicated in S3.
    // TODO: Save the new report in S3.
    // TODO: Alert only if the price was different.

    // TODO: If the price has changed, do a diff on the report to determine exactly what changed.

    // Simple temporary bill alert message.
    const message = 'Current bill amount: $' + totalPrice;
    console.log( message );

    sendSnsMessage( message )
      .then( resolve )
      .catch( reject );

  }); // Return new Promise.
} // Function maybeSendMessage.

/**
 * Sends an SNS message to the topic provided by the environment.
 *
 * @param {string} message The message to send.
 * @return {Promise} A promise to send the message, funnily enough!
 */
function sendSnsMessage( message ) {
  return new Promise( ( resolve, reject ) => {

    if ( ! SNS_TOPIC ) {
      reject( 'No SNS_TOPIC provided.' );
      return;
    }

    const snsMessage = {
      Message:  JSON.stringify( message ),
      TopicArn: SNS_TOPIC
    };

    const sns = new aws.SNS();

    sns.publish( snsMessage, ( error, result ) => {

      if ( error ) {
        reject( error );
        return;
      }

      resolve( result );

    }); // Sns.publish.

  }); // Return Promise.
} // Function sendSnsMessage.

/**
 * Pads a 1 digit number so it starts with a 0.
 */
function padTo2Digits( number ) {
  return number < 10 ? '0' + number : number; // eslint-disable-line no-magic-numbers, yoda
}
