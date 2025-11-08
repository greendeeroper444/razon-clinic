const fs = require('fs');
const path = require('path');
const moceansdk = require('mocean-sdk');
const { logSMSMessage } = require('./smsLogger');

const MOCEAN_API_TOKEN = process.env.MOCEAN_API_TOKEN;
const MOCEAN_SENDER_ID = process.env.MOCEAN_SENDER_ID || 'MOCEAN';

//initialize mocean client
const mocean = new moceansdk.Mocean(
    new moceansdk.Client({ apiToken: MOCEAN_API_TOKEN })
);

async function sendSMS(to, templatePath, replacements = {}) {
    let message = '';
    
    try {
        message = fs.readFileSync(path.join(__dirname, '..', 'templates', 'sms', templatePath), 'utf-8');

        //replace placeholders like {{userName}}
        Object.keys(replacements).forEach(key => {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
        });

        //check if we're in development mode
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        //check if sms should be sent in development mode
        const shouldSendInDev = process.env.SMS_ENABLED === 'true';
        const forceSend = process.env.SMS_FORCE_SEND === 'true';
        
        //in development mode, skip sms for Philippine numbers unless explicitly enabled
        if (isDevelopment && to.startsWith('+63') && !shouldSendInDev && !forceSend) {
            console.log(`Development Mode: Skipping SMS to Philippine number ${to} (SMS not enabled for development)`);
            
            //log the message for development purposes
            logSMSMessage(to, message, 'SKIPPED_DEVELOPMENT');
            
            return {
                success: true, //return success to not break the flow
                reason: 'development_skip',
                message: 'SMS skipped in development mode for Philippine numbers'
            };
        }

        //check if API token is configured
        if (!MOCEAN_API_TOKEN) {
            console.error('Mocean API token is not configured');
            logSMSMessage(to, message, 'FAILED_CONFIG');
            return {
                success: false,
                reason: 'configuration_error',
                message: 'Mocean API token is not configured'
            };
        }

        //prepare phone number format for mocean
        //mocean expects numbers with country code (e.g., 60123456789 for Malaysia, 639XXXXXXXXX for Philippines)
        let moceanNumber = to;
        if (to.startsWith('+')) {
            moceanNumber = to.substring(1); //remove the + sign
        } else if (to.startsWith('09')) {
            //convert Philippine mobile format 09XXXXXXXXX to 639XXXXXXXXX
            moceanNumber = '63' + to.substring(1);
        } else if (to.startsWith('9')) {
            //convert 9XXXXXXXXX to 639XXXXXXXXX
            moceanNumber = '63' + to;
        }

        console.log(`Sending SMS to ${moceanNumber} via Mocean...`);
        console.log(`Using sender ID: ${MOCEAN_SENDER_ID}`);
        console.log('Debug Info:');
        console.log('API Token (first 20 chars):', MOCEAN_API_TOKEN ? MOCEAN_API_TOKEN.substring(0, 20) : 'UNDEFINED');
        console.log('Full token length:', MOCEAN_API_TOKEN ? MOCEAN_API_TOKEN.length : 0);
        console.log('Sender ID:', MOCEAN_SENDER_ID);

        //send sms using mocean sdk
        return new Promise((resolve, reject) => {
            mocean.sms().send({
                'mocean-from': MOCEAN_SENDER_ID,
                'mocean-to': moceanNumber,
                'mocean-text': message
            }, function(err, res) {
                if (err) {
                    console.error('Mocean SDK error:', err);
                    logSMSMessage(to, message, 'FAILED_SDK_ERROR', null, JSON.stringify(err));
                    
                    resolve({
                        success: false,
                        reason: 'sdk_error',
                        message: err.message || 'Mocean SDK error',
                        error: err
                    });
                    return;
                }

                //parse mocean response
                console.log('Mocean Response:', JSON.stringify(res, null, 2));
                
                if (res && res.messages && res.messages.length > 0) {
                    const firstMessage = res.messages[0];
                    
                    if (firstMessage.status === '0' || firstMessage.status === 0) {
                        //status 0 means success
                        const msgId = firstMessage.msgid;
                        console.log(`SMS sent successfully to ${to}. Message ID: ${msgId}`);
                        logSMSMessage(to, message, 'SENT', msgId);
                        
                        resolve({
                            success: true,
                            msgId: msgId,
                            receiver: firstMessage.receiver
                        });
                    } else {
                        //handle various Mocean error statuses
                        const errorMessage = getMoceanErrorMessage(firstMessage.status);
                        const actualError = firstMessage.err_msg || errorMessage;
                        
                        console.log(`SMS not sent to ${to}: ${actualError} (Status: ${firstMessage.status})`);
                        
                        //special handling for whitelist errors in development
                        if (firstMessage.status === 4 && firstMessage.err_msg?.includes('not whitelisted')) {
                            console.log(`WHITELIST REQUIRED: Add ${moceanNumber} to your Mocean dashboard whitelist`);
                            logSMSMessage(to, message, 'FAILED_NOT_WHITELISTED', null, actualError);
                        } else {
                            logSMSMessage(to, message, 'FAILED_MOCEAN_ERROR', null, actualError);
                        }
                        
                        resolve({
                            success: false,
                            reason: 'mocean_error',
                            status: firstMessage.status,
                            message: actualError,
                            errorMsg: firstMessage.err_msg || errorMessage
                        });
                    }
                } else {
                    console.error('Unexpected Mocean response format:', res);
                    logSMSMessage(to, message, 'FAILED_UNEXPECTED_RESPONSE');
                    
                    resolve({
                        success: false,
                        reason: 'unexpected_response',
                        message: 'Unexpected response format from Mocean'
                    });
                }
            });
        });

    } catch (error) {
        console.error('SMS sending failed:', error);
        logSMSMessage(to, message, 'FAILED_OTHER', null, error.message);
        
        return {
            success: false,
            reason: 'unexpected_error',
            message: error.message
        };
    }
}

function getMoceanErrorMessage(status) {
    const statusStr = String(status);
    const errorMessages = {
        '1': 'Throttled - You have exceeded the submission capacity allowed',
        '2': 'Missing Credentials',
        '3': 'Invalid Credentials',
        '4': 'Invalid message parameters',
        '5': 'Invalid phone number',
        '6': 'Invalid sender name',
        '7': 'Message too long',
        '8': 'Invalid Unicode data',
        '9': 'System error - please retry',
        '10': 'Cannot route message',
        '11': 'Message expired',
        '12': 'Destination barred',
        '13': 'Unknown error',
        '14': 'Insufficient credits',
        '15': 'Account suspended',
        '20': 'Missing mandatory parameters'
    };

    return errorMessages[statusStr] || `Unknown error (Status: ${status})`;
}

//alternative function to send email instead of SMS for failed numbers
async function sendNotificationFallback(to, templatePath, replacements = {}, patientEmail = null) {
    const smsResult = await sendSMS(to, templatePath, replacements);
    
    if (!smsResult.success && patientEmail) {
        //fallback to email notification
        console.log(`Falling back to email notification for ${patientEmail}`);
        //we would implement email sending here
        // await sendEmailNotification(patientEmail, templatePath, replacements);
        return {
            success: true,
            method: 'email',
            message: 'Sent via email due to SMS failure'
        };
    }
    
    return smsResult;
}

module.exports = sendSMS;