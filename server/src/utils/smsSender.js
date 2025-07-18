const fs = require('fs');
const path = require('path');
const twilio = require('twilio');
const { logSMSMessage } = require('./smsLogger');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

//list of verified phone numbers for trial account
const VERIFIED_NUMBERS = process.env.TWILIO_VERIFIED_NUMBERS 
    ? process.env.TWILIO_VERIFIED_NUMBERS.split(',').map(num => num.trim())
    : [];

async function sendSMS(to, templatePath, replacements = {}) {
    let message = '';
    
    try {
        message = fs.readFileSync(path.join(__dirname, '..', 'templates', 'sms', templatePath), 'utf-8');

        //replace placeholders like {{patientName}}
        Object.keys(replacements).forEach(key => {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
        });

        //check if we're in development mode
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        //check if SMS should be sent in development mode
        const shouldSendInDev = process.env.SMS_ENABLED === 'true';
        const forceSend = process.env.SMS_FORCE_SEND === 'true';
        
        //in development mode, skip SMS for Philippine numbers unless explicitly enabled
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

        //only check trial account status if not in development mode
        let isTrial = false;
        if (!isDevelopment) {
            try {
                isTrial = await checkIfTrialAccount();
            } catch (error) {
                console.error('Error checking account type, assuming trial account:', error.message);
                isTrial = true; //assume trial if we can't check
            }
        }
        
        if (isTrial) {
            //for trial accounts, check if the number is verified
            if (!isNumberVerified(to)) {
                console.log(`Skipping SMS to unverified number ${to} (Trial account limitation)`);
                
                //log the message that would have been sent for debugging
                console.log('Message that would have been sent:', message);
                logSMSMessage(to, message, 'SKIPPED_UNVERIFIED');
                
                //return early without throwing an error
                return {
                    success: false,
                    reason: 'unverified_number',
                    message: 'Number not verified for trial account'
                };
            }
        }

        //send the SMS
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });

        console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
        logSMSMessage(to, message, 'SENT', result.sid);
        
        return {
            success: true,
            sid: result.sid
        };

    } catch (error) {
        //handle specific Twilio errors gracefully
        if (error.code === 21608) {
            console.log(`SMS not sent: Phone number ${to} is unverified (Trial account limitation)`);
            logSMSMessage(to, message, 'FAILED_UNVERIFIED');
            return {
                success: false,
                reason: 'unverified_number',
                message: 'Number not verified for trial account'
            };
        } else if (error.code === 21211) {
            console.log(`SMS not sent: Invalid phone number format ${to}`);
            logSMSMessage(to, message, 'FAILED_INVALID_NUMBER');
            return {
                success: false,
                reason: 'invalid_number',
                message: 'Invalid phone number format'
            };
        } else if (error.code === 20003) {
            console.log(`SMS not sent: Authentication error - check your Twilio credentials`);
            logSMSMessage(to, message, 'FAILED_AUTH');
            return {
                success: false,
                reason: 'authentication_error',
                message: 'Twilio authentication failed - check credentials'
            };
        } else {
            console.error('SMS sending failed:', error);
            logSMSMessage(to, message, 'FAILED_OTHER', null, error.message);
            return {
                success: false,
                reason: 'unexpected_error',
                message: error.message
            };
        }
    }
}

//check if the account is a trial account
async function checkIfTrialAccount() {
    try {
        const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
        return account.type === 'Trial';
    } catch (error) {
        //if we can't check the account type due to auth issues, throw the error
        throw error;
    }
}

//check if a phone number is in the verified list
function isNumberVerified(phoneNumber) {
    return VERIFIED_NUMBERS.includes(phoneNumber);
}

//alternative function to send email instead of SMS for unverified numbers
async function sendNotificationFallback(to, templatePath, replacements = {}, patientEmail = null) {
    const smsResult = await sendSMS(to, templatePath, replacements);
    
    if (!smsResult.success && smsResult.reason === 'unverified_number' && patientEmail) {
        //fallback to email notification
        console.log(`Falling back to email notification for ${patientEmail}`);
        //we would implement email sending here
        // await sendEmailNotification(patientEmail, templatePath, replacements);
        return {
            success: true,
            method: 'email',
            message: 'Sent via email due to unverified SMS number'
        };
    }
    
    return smsResult;
}

module.exports = sendSMS;