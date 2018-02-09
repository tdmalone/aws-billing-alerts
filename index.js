/**
 * A simple AWS Lambda function that sends SNS alerts when your current month's bill changes.
 *
 * @author Tim Malone <tdmalone@gmail.com>
 */

'use strict';

const aws = require( 'aws-sdk' ),
      parseCsv = require( 'csv-parse/lib/sync' );

const SNS_TOPIC = process.env.SNS_TOPIC; // eslint-disable-line no-process-env

const FIRST_ITEM = 0,
      ONLY_ITEM = 0,
      SECOND_LAST_LINE = -2,
      LAST_LINE = -1;

exports.handler = ( event, context, callback ) => {

  // Get current monthly bill amount.
  // Store in S3.
  // Alert if it's different.

  const s3 = new aws.S3();

  const params = {
    Bucket: event.Records[ FIRST_ITEM ].s3.bucket.name,
    Key:    event.Records[ FIRST_ITEM ].s3.object.key
  };

  s3.getObject( params, ( error, data ) => {

    if ( error ) {
      callback( error );
      return;
    }

    const csvData = parseCsv( data.Body.toString() );

    // Second last line, immediately before the disclaimer.
    const billingLineTotal = csvData.slice( SECOND_LAST_LINE, LAST_LINE )[ ONLY_ITEM ];
    const totalPrice = billingLineTotal.pop();

    const message = totalPrice;

    console.log( message );

    sendSnsMessage( message ).then( ( response ) => {
      callback( null, response );
    }).catch( ( error ) => {
      callback( error );
    });

  });

};

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
