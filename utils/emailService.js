// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     host: 'smtp-relay.brevo.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.BREVO_SMTP_LOGIN,
//         pass: process.env.BREVO_SMTP_KEY
//     }
// });

// transporter.verify(function(error,success) {
//     if (error)
//     {
//         console.error('[BREVO] SMTP connection FAILED:', {
//             message: error.message,
//             code: error.code,
//             response: error.response
//         });
//     }
//     else
//     {
//         console.log('SMTP server is ready to send messages');
//     }
// });

// const sendVerificationEmail = async (email, token, username, appUrl) => {
//     const verificationUrl = `${appUrl}/api/auth/verify-email/${token}`;

//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: email,
//         subject: 'Verify Your Eventz Account',
//         html: `
//             <div style = "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
//                 <h2 style = "color: #007AFF;">Welcome to Eventz!</h2>
//                 <p>Hi ${username},</p>
//                 <p>Please click the button below to verify your email address:</p>
                
//                 <div style = "text-align: center; margin: 25px 0;">
//                     <a href = "${verificationUrl}" 
//                        style = "background-color: #007AFF; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
//                         Verify Email Address
//                     </a>
//                 </div>
                
//                 <p>Or copy this link to your browser:</p>
//                 <div style = "background-color: #f5f5f5; padding: 12px; border-radius: 5px; margin: 15px 0;">
//                     <code style = "word-break: break-all; font-size: 13px;">${verificationUrl}</code>
//                 </div>
                
//                 <p><strong>This link expires in 24 hours.</strong></p>
                
//                 <div style = "margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
//                     <p>If you didn't create this account, please ignore this email.</p>
//                     <p>© ${new Date().getFullYear()} Eventz</p>
//                 </div>
//             </div>
//         `
//     };

//     try
//     {
//         console.log('Attempting to send verification email to:', email);
//         const info = await transporter.sendMail(mailOptions);

//         console.log('Email sent successfully!', {
//             messageId: info.messageId,
//             to: email,
//             verificationUrl: verificationUrl
//         });
//         return true;
//     }
//     catch (error)
//     {
//         console.error('Email send faield:', {
//             message: error.message,
//             code: error.code,
//             response: error.response
//         });
//         return false;
//     }
// };

// module.exports = { sendVerificationEmail };

const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_KEY
    }
});

transporter.verify(function(error,success) {
    if (error)
    {
        console.error('SMTP connection FAILED:', {
            message: error.message,
            code: error.code,
            response: error.response
        });
    }
    else
    {
        console.log('SMTP server is ready to send messages');
    }
});

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
    const verificationUrl = `${appUrl}/api/auth/verify-email/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Eventz Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #007AFF;">Welcome to Eventz!</h2>
                <p>Hi ${username},</p>
                <p>Please click the button below to verify your email address:</p>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #007AFF; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                
                <p>Or copy this link to your browser:</p>
                <div style="background-color: #f5f5f5; padding: 12px; border-radius: 5px; margin: 15px 0;">
                    <code style="word-break: break-all; font-size: 13px;">${verificationUrl}</code>
                </div>
                
                <p><strong>This link expires in 24 hours.</strong></p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                    <p>If you didn't create this account, please ignore this email.</p>
                    <p>© ${new Date().getFullYear()} Eventz</p>
                </div>
            </div>
        `
    };

    try
    {
        console.log('Attempting to send verification email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            to: email,
            verificationUrl: verificationUrl
        });
        return true;
    }
    catch (error)
    {
        console.error('Email send failed:', {
            message: error.message,
            code: error.code,
            response: error.response
        });
        return false;
    }
};

const sendGuestInvitationEmail = async (guestEmail, guestName, eventTitle, eventDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: guestEmail,
        subject: `You're Invited: ${eventTitle}`,
        html: `
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
    };

    try
    {
        await transporter.sendMail(mailOptions);
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