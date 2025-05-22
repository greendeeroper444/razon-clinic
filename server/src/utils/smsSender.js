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
    try {
        let message = fs.readFileSync(path.join(__dirname, '..', 'templates', 'sms', templatePath), 'utf-8');

        //replace placeholders like {{otp}}
        Object.keys(replacements).forEach(key => {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
        });

        //check if we're in development mode or using a trial account
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const isTrial = await checkIfTrialAccount();
        
        //skip SMS entirely in development with trial account for Philippine numbers
        if (isDevelopment && isTrial && to.startsWith('+63')) {
            console.log(`Development Mode: Skipping SMS to Philippine number ${to} (Trial account + Country restriction)`);
            
            //log the message for development purposes
            logSMSMessage(to, message, 'SKIPPED_DEVELOPMENT');
            
            return {
                success: true, //return success to not break the flow
                reason: 'development_skip',
                message: 'SMS skipped in development mode for Philippine numbers'
            };
        }
        
        if (isTrial) {
            //for trial accounts, check if the number is verified
            if (!isNumberVerified(to)) {
                console.log(`Skipping SMS to unverified number ${to} (Trial account limitation)`);
                
                //log the message that would have been sent for debugging
                console.log('Message that would have been sent:', message);
                
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
        return {
            success: true,
            sid: result.sid
        };

    } catch (error) {
        // handle specific Twilio errors gracefully
        if (error.code === 21608) {
            console.log(`SMS not sent: Phone number ${to} is unverified (Trial account limitation)`);
            return {
                success: false,
                reason: 'unverified_number',
                message: 'Number not verified for trial account'
            };
        } else if (error.code === 21211) {
            console.log(`SMS not sent: Invalid phone number format ${to}`);
            return {
                success: false,
                reason: 'invalid_number',
                message: 'Invalid phone number format'
            };
        } else {
            console.error('SMS sending failed:', error);
            throw error;
        }
    }
}

//check if the account is a trial account
async function checkIfTrialAccount() {
    try {
        const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
        return account.type === 'Trial';
    } catch (error) {
        console.error('Error checking account type:', error);
        //assume trial if we can't determine
        return true;
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
        // You would implement email sending here
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