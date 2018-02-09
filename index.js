/**
 * A simple AWS Lambda function that sends SNS alerts when your current month's bill changes.
 *
 * @author Tim Malone <tdmalone@gmail.com>
 */

const aws = require( 'aws-sdk' );
const SNS_TOPIC = process.env.SNS_TOPIC;

exports.handler = (event, context, callback) => {

  // Get current monthly bill amount.
  // Store in S3.
  // Alert if it's different.

  const message = 'Coming soon.';

  sendSnsMessage( message ).then( ( response ) => {
    callback( null, response );
  }).catch( ( error ) => {
    callback( error );
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
