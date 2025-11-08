// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const { logSMSMessage } = require('./smsLogger');

// const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
// const SEMAPHORE_SENDER_NAME = process.env.SEMAPHORE_SENDER_NAME || 'SEMAPHORE';
// const SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages';

// async function sendSMS(to, templatePath, replacements = {}) {
//     let message = '';
    
//     try {
//         message = fs.readFileSync(path.join(__dirname, '..', 'templates', 'sms', templatePath), 'utf-8');

//         //replace placeholders like {{userName}}
//         Object.keys(replacements).forEach(key => {
//             message = message.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
//         });

//         //check if we're in development mode
//         const isDevelopment = process.env.NODE_ENV !== 'production';
        
//         //check if sms should be sent in development mode
//         const shouldSendInDev = process.env.SMS_ENABLED === 'true';
//         const forceSend = process.env.SMS_FORCE_SEND === 'true';
        
//         //in development mode, skip sms for Philippine numbers unless explicitly enabled
//         if (isDevelopment && to.startsWith('+63') && !shouldSendInDev && !forceSend) {
//             console.log(`Development Mode: Skipping SMS to Philippine number ${to} (SMS not enabled for development)`);
            
//             //log the message for development purposes
//             logSMSMessage(to, message, 'SKIPPED_DEVELOPMENT');
            
//             return {
//                 success: true, //return success to not break the flow
//                 reason: 'development_skip',
//                 message: 'SMS skipped in development mode for Philippine numbers'
//             };
//         }

//         //check if API key is configured
//         if (!SEMAPHORE_API_KEY) {
//             console.error('Semaphore API key is not configured');
//             logSMSMessage(to, message, 'FAILED_CONFIG');
//             return {
//                 success: false,
//                 reason: 'configuration_error',
//                 message: 'Semaphore API key is not configured'
//             };
//         }

//         //prepare phone number format for Semaphore
//         //Semaphore expects Philippine numbers in format: 09XXXXXXXXX or 639XXXXXXXXX
//         let semaphoreNumber = to;
//         if (to.startsWith('+63')) {
//             semaphoreNumber = '0' + to.substring(3); // +639XXXXXXXXX -> 09XXXXXXXXX
//         } else if (to.startsWith('63') && to.length === 12) {
//             semaphoreNumber = '0' + to.substring(2); // 639XXXXXXXXX -> 09XXXXXXXXX
//         } else if (to.startsWith('9') && to.length === 10) {
//             semaphoreNumber = '0' + to; // 9XXXXXXXXX -> 09XXXXXXXXX
//         }

//         console.log(`Sending SMS to ${semaphoreNumber} via Semaphore...`);
//         console.log(`Using sender name: ${SEMAPHORE_SENDER_NAME}`);
//         console.log('Debug Info:');
//         console.log('API Key (first 20 chars):', SEMAPHORE_API_KEY ? SEMAPHORE_API_KEY.substring(0, 20) : 'UNDEFINED');
//         console.log('Full key length:', SEMAPHORE_API_KEY ? SEMAPHORE_API_KEY.length : 0);
//         console.log('Sender Name:', SEMAPHORE_SENDER_NAME);

//         //send sms using Semaphore API
//         const response = await axios.post(SEMAPHORE_API_URL, {
//             apikey: SEMAPHORE_API_KEY,
//             number: semaphoreNumber,
//             message: message,
//             sendername: SEMAPHORE_SENDER_NAME
//         }, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         console.log('Semaphore Response:', JSON.stringify(response.data, null, 2));

//         //handle Semaphore response
//         if (response.data && response.data.length > 0) {
//             const firstMessage = response.data[0];
            
//             if (firstMessage.message_id) {
//                 //message sent successfully
//                 const msgId = firstMessage.message_id;
//                 console.log(`SMS sent successfully to ${to}. Message ID: ${msgId}`);
//                 logSMSMessage(to, message, 'SENT', msgId);
                
//                 return {
//                     success: true,
//                     msgId: msgId,
//                     receiver: semaphoreNumber
//                 };
//             } else if (firstMessage.error) {
//                 //handle error
//                 console.log(`SMS not sent to ${to}: ${firstMessage.message}`);
//                 logSMSMessage(to, message, 'FAILED_SEMAPHORE_ERROR', null, firstMessage.message);
                
//                 return {
//                     success: false,
//                     reason: 'semaphore_error',
//                     message: firstMessage.message,
//                     errorCode: firstMessage.code
//                 };
//             }
//         }

//         //unexpected response format
//         console.error('Unexpected Semaphore response format:', response.data);
//         logSMSMessage(to, message, 'FAILED_UNEXPECTED_RESPONSE');
        
//         return {
//             success: false,
//             reason: 'unexpected_response',
//             message: 'Unexpected response format from Semaphore'
//         };

//     } catch (error) {
//         console.error('SMS sending failed:', error);
        
//         //handle axios errors
//         if (error.response) {
//             //server responded with error status
//             const errorData = error.response.data;
//             const errorMessage = errorData?.message || error.message;
            
//             console.error('Semaphore API Error:', errorData);
//             logSMSMessage(to, message, 'FAILED_API_ERROR', null, errorMessage);
            
//             return {
//                 success: false,
//                 reason: 'api_error',
//                 message: errorMessage,
//                 statusCode: error.response.status
//             };
//         } else if (error.request) {
//             //request made but no response
//             console.error('No response from Semaphore API');
//             logSMSMessage(to, message, 'FAILED_NO_RESPONSE', null, 'No response from API');
            
//             return {
//                 success: false,
//                 reason: 'no_response',
//                 message: 'No response from Semaphore API'
//             };
//         } else {
//             //other error
//             logSMSMessage(to, message, 'FAILED_OTHER', null, error.message);
            
//             return {
//                 success: false,
//                 reason: 'unexpected_error',
//                 message: error.message
//             };
//         }
//     }
// }

// //alternative function to send email instead of SMS for failed numbers
// async function sendNotificationFallback(to, templatePath, replacements = {}, patientEmail = null) {
//     const smsResult = await sendSMS(to, templatePath, replacements);
    
//     if (!smsResult.success && patientEmail) {
//         //fallback to email notification
//         console.log(`Falling back to email notification for ${patientEmail}`);
//         //we would implement email sending here
//         // await sendEmailNotification(patientEmail, templatePath, replacements);
//         return {
//             success: true,
//             method: 'email',
//             message: 'Sent via email due to SMS failure'
//         };
//     }
    
//     return smsResult;
// }

// module.exports = sendSMS;

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { logSMSMessage } = require('./smsLogger');

const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_SENDER_NAME = process.env.SEMAPHORE_SENDER_NAME || 'SEMAPHORE';
const SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages';

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

        //check if API key is configured
        if (!SEMAPHORE_API_KEY) {
            console.error('Semaphore API key is not configured');
            logSMSMessage(to, message, 'FAILED_CONFIG');
            return {
                success: false,
                reason: 'configuration_error',
                message: 'Semaphore API key is not configured'
            };
        }

        //prepare phone number format for Semaphore
        //Semaphore expects Philippine numbers in format: 09XXXXXXXXX or 639XXXXXXXXX
        let semaphoreNumber = to;
        if (to.startsWith('+63')) {
            semaphoreNumber = '0' + to.substring(3); // +639XXXXXXXXX -> 09XXXXXXXXX
        } else if (to.startsWith('63') && to.length === 12) {
            semaphoreNumber = '0' + to.substring(2); // 639XXXXXXXXX -> 09XXXXXXXXX
        } else if (to.startsWith('9') && to.length === 10) {
            semaphoreNumber = '0' + to; // 9XXXXXXXXX -> 09XXXXXXXXX
        }

        console.log(`Sending SMS to ${semaphoreNumber} via Semaphore...`);
        console.log(`Using sender name: ${SEMAPHORE_SENDER_NAME}`);
        console.log('Debug Info:');
        console.log('API Key (first 20 chars):', SEMAPHORE_API_KEY ? SEMAPHORE_API_KEY.substring(0, 20) : 'UNDEFINED');
        console.log('Full key length:', SEMAPHORE_API_KEY ? SEMAPHORE_API_KEY.length : 0);
        console.log('Sender Name:', SEMAPHORE_SENDER_NAME);

        //prepare request payload
        const payload = {
            apikey: SEMAPHORE_API_KEY,
            number: semaphoreNumber,
            message: message
        };

        //only add sendername if it's provided and not the default
        //Semaphore has strict rules: sender name must be registered in your account
        if (SEMAPHORE_SENDER_NAME && SEMAPHORE_SENDER_NAME !== 'SEMAPHORE') {
            payload.sendername = SEMAPHORE_SENDER_NAME;
        }

        console.log('Request payload:', { ...payload, apikey: '***' });

        //send sms using Semaphore API
        const response = await axios.post(SEMAPHORE_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Semaphore Response:', JSON.stringify(response.data, null, 2));

        //handle Semaphore response
        const responseData = response.data;

        //check for validation errors (e.g., invalid sender name)
        if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
            //validation error format: { "sendername": ["error message"], "field": ["error"] }
            const errors = Object.keys(responseData).map(key => `${key}: ${responseData[key].join(', ')}`).join('; ');
            console.error(`Semaphore validation error: ${errors}`);
            logSMSMessage(to, message, 'FAILED_VALIDATION_ERROR', null, errors);
            
            return {
                success: false,
                reason: 'validation_error',
                message: errors
            };
        }

        //successful response format is an array
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
            const firstMessage = responseData[0];
            
            if (firstMessage.message_id) {
                //message sent successfully
                const msgId = firstMessage.message_id;
                console.log(`SMS sent successfully to ${to}. Message ID: ${msgId}`);
                logSMSMessage(to, message, 'SENT', msgId);
                
                return {
                    success: true,
                    msgId: msgId,
                    receiver: semaphoreNumber
                };
            } else if (firstMessage.error) {
                //handle error
                console.log(`SMS not sent to ${to}: ${firstMessage.message}`);
                logSMSMessage(to, message, 'FAILED_SEMAPHORE_ERROR', null, firstMessage.message);
                
                return {
                    success: false,
                    reason: 'semaphore_error',
                    message: firstMessage.message,
                    errorCode: firstMessage.code
                };
            }
        }

        //unexpected response format
        console.error('Unexpected Semaphore response format:', responseData);
        logSMSMessage(to, message, 'FAILED_UNEXPECTED_RESPONSE');
        
        return {
            success: false,
            reason: 'unexpected_response',
            message: 'Unexpected response format from Semaphore'
        };

    } catch (error) {
        console.error('SMS sending failed:', error);
        
        //handle axios errors
        if (error.response) {
            //server responded with error status
            const errorData = error.response.data;
            const errorMessage = errorData?.message || error.message;
            
            console.error('Semaphore API Error:', errorData);
            logSMSMessage(to, message, 'FAILED_API_ERROR', null, errorMessage);
            
            return {
                success: false,
                reason: 'api_error',
                message: errorMessage,
                statusCode: error.response.status
            };
        } else if (error.request) {
            //request made but no response
            console.error('No response from Semaphore API');
            logSMSMessage(to, message, 'FAILED_NO_RESPONSE', null, 'No response from API');
            
            return {
                success: false,
                reason: 'no_response',
                message: 'No response from Semaphore API'
            };
        } else {
            //other error
            logSMSMessage(to, message, 'FAILED_OTHER', null, error.message);
            
            return {
                success: false,
                reason: 'unexpected_error',
                message: error.message
            };
        }
    }
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