const dns = require('dns').promises;
const crypto = require('crypto');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'eventz.notifications@gmail.com'

const verifyEmailDomain = async (email) => {
    try
    {
        const domain = email.split('@')[1];
        const addresses = await dns.resolveMx(domain);
        if (!addresses || addresses.length === 0)
        {
            return false;
        }

        try
        {
            await dns.resolve4(domain);
        }
        catch
        {
            try
            {
                await dns.resolve6(domain);
            }
            catch
            {
                return false;
            }
        }

        return true;
    }
    catch (error)
    {
        console.error('Domain verification error:', error);
        return false;
    }
};

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email, token, username, appUrl) => {
    console.log('sendVerificationEmail called');
    console.log('Recipient:', email);
    console.log('Token:', token);
    console.log('Username:', username);
    console.log('Using APP URL:', appUrl);
    const verificationUrl = `${appUrl}/verify-email/${token}`;
    console.log('Verification URL:', verificationUrl);

    try
    {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: email }],
                    subject: 'Verify Your Eventz Account'
                }],
                from: {
                    email: SENDGRID_FROM_EMAIL,
                    name: 'Eventz'
                },
                content: [{ 
                    type: 'text/html',
                    value: `
                        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
                            <h2 style="color: #007AFF;">Welcome to Eventz!</h2>
                            <p>Hi ${username},</p>
                            <p>Thank you for registering with Eventz. Please verify your email address by clicking the button below:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" style="background-color: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Verify Email Address
                                </a>
                            </div>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="color: #505050; word-break: break-all;">${verificationUrl}</p>
                            <p>This link will expire in 24 hours.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #DAD8D9;">
                            <p style="color: #909090; font-size: 12px;">Eventz - Your Event Planning Assistant</p>
                        </div>
                    `
                 }]
            })
        });

        if (!response.ok)
        {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            return false;
        }
        
        console.log('Email sent successfully');
        return true;
    }
    catch (error)
    {
        console.error('Error sending email:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return false;
    }
};

const sendGuestInvitationEmail = async (guestEmail, guestName, eventTitle, eventDetails) => {
    try
    {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: guestEmail }],
                    subject: `You're Invited: ${eventTitle}`
                }],
                from: {
                    email: SENDGRID_FROM_EMAIL,
                    name: 'Eventz'
                },
                content: [{ 
                    type: 'text/html',
                    value: `
                        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
                            <h2 style="color: #007AFF;">You're Invited!</h2>
                            <p>Hi ${guestName},</p>
                            <p>You have been invited to the following event:</p>
                            <div style="background-color: #F0F0F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #3A3A3A; margin-top: 0;">${eventTitle}</h3>
                                <p style="margin: 10px 0;"><strong>Description:</strong> ${eventDetails.description}</p>
                                <p style="margin: 10px 0;"><strong>Location:</strong> ${eventDetails.location}</p>
                                <p style="margin: 10px 0;"><strong>Start:</strong> ${eventDetails.start_date}</p>
                                <p style="margin: 10px 0;"><strong>End:</strong> ${eventDetails.end_date}</p>
                            </div>
                            <p>We look forward to seeing you there!</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #DAD8D9;">
                            <p style="color: #909090; font-size: 12px;">Eventz - Your Event Planning Assistant</p>
                        </div>
                    `
                 }]
            })
        });

        if (!response.ok)
        {
            console.error('API error');
            return false;
        }

        console.log('Invitation email sent successfully');
        return true;
    }
    catch (error)
    {
        console.error('Error sending invitation email:', error);
        return false;
    }
};

module.exports = {
    verifyEmailDomain,
    generateVerificationToken,
    sendVerificationEmail,
    sendGuestInvitationEmail
};