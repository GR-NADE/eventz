const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, token, username, appUrl) => {
    const verificationUrl = `${appUrl}/verify-email/${token}`;

    try
    {
        const { data, error } = await resend.emails.send({
            from: 'Eventz <onboarding@resend.dev>',
            to: email,
            subject: 'Verify Your Eventz Account',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
                    <h2 style="color: #007AFF;">Welcome to Eventz!</h2>
                    <p>Hi ${username},</p>
                    <p>Thank you for registering with Eventz. Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-family: 'Poppins', sans-serif;">
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
        });

        if (error)
        {
            console.error('[RESEND] Error sending email:', error);
            return false;
        }

        console.log('[RESEND] Email sent successfully. ID:', data.id);
        return true;
    }
    catch (error)
    {
        console.error('[RESEND] Unexpected error:', error);
        return false;
    }
};

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

module.exports = {
    sendVerificationEmail,
    verifyEmailDomain
};

// const nodemailer = require('nodemailer');
// const dns = require('dns').promises;
// const crypto = require('crypto');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,
//         clientId: process.env.OAUTH_CLIENT_ID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN,
//         accessToken: process.env.OAUTH_ACCESS_TOKEN
//     }
// });

// transporter.verify((error, success) => {
//     if (error)
//     {
//         console.error('Email transporter error:', error);
//     }
//     else
//     {
//         console.log('Email server is ready');
//     }
// });

// const verifyEmailDomain = async (email) => {
//     try
//     {
//         const domain = email.split('@')[1];
//         const addresses = await dns.resolveMx(domain);
//         if (!addresses || addresses.length === 0)
//         {
//             return false;
//         }

//         try
//         {
//             await dns.resolve4(domain);
//         }
//         catch
//         {
//             try
//             {
//                 await dns.resolve6(domain);
//             }
//             catch
//             {
//                 return false;
//             }
//         }

//         return true;
//     }
//     catch (error)
//     {
//         console.error('Domain verification error:', error);
//         return false;
//     }
// };

// const generateVerificationToken = () => {
//     return crypto.randomBytes(32).toString('hex');
// };

// const sendVerificationEmail = async (email, token, username, appUrl) => {
//     const verificationUrl = `${appUrl}/verify-email/${token}`;

//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: email,
//         subject: 'Verify Your Eventz Account',
//         html: `
//             <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
//                 <h2 style="color: #007AFF;">Welcome to Eventz!</h2>
//                 <p>Hi ${username},</p>
//                 <p>Thank you for registering with Eventz. Please verify your email address by clicking the button below:</p>
//                 <div style="text-align: center; margin: 30px 0;">
//                     <a href="${verificationUrl}" style="background-color: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-family: 'Poppins', sans-serif;">
//                         Verify Email Address
//                     </a>
//                 </div>
//                 <p>Or copy and paste this link into your browser:</p>
//                 <p style="color: #505050; word-break: break-all;">${verificationUrl}</p>
//                 <p>This link will expire in 24 hours.</p>
//                 <p>If you didn't create an account, please ignore this email.</p>
//                 <hr style="margin: 30px 0; border: none; border-top: 1px solid #DAD8D9;">
//                 <p style="color: #909090; font-size: 12px;">Eventz - Your Event Planning Assistant</p>
//             </div>
//         `
//     };

//     try
//     {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully:', info.messageId);
//         return true;
//     }
//     catch (error)
//     {
//         console.error('Error sending email:', error);
//         return false;
//     }
// };

// const sendGuestInvitationEmail = async (guestEmail, guestName, eventTitle, eventDetails) => {
//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: guestEmail,
//         subject: `You're Invited: ${eventTitle}`,
//         html: `
//             <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
//                 <h2 style="color: #007AFF;">You're Invited!</h2>
//                 <p>Hi ${guestName},</p>
//                 <p>You have been invited to the following event:</p>
//                 <div style="background-color: #F0F0F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
//                     <h3 style="color: #3A3A3A; margin-top: 0;">${eventTitle}</h3>
//                     <p style="margin: 10px 0;"><strong>Description:</strong> ${eventDetails.description}</p>
//                     <p style="margin: 10px 0;"><strong>Location:</strong> ${eventDetails.location}</p>
//                     <p style="margin: 10px 0;"><strong>Start:</strong> ${eventDetails.start_date}</p>
//                     <p style="margin: 10px 0;"><strong>End:</strong> ${eventDetails.end_date}</p>
//                 </div>
//                 <p>We look forward to seeing you there!</p>
//                 <hr style="margin: 30px 0; border: none; border-top: 1px solid #DAD8D9;">
//                 <p style="color: #909090; font-size: 12px;">Eventz - Your Event Planning Assistant</p>
//             </div>
//         `
//     };

//     try
//     {
//         await transporter.sendMail(mailOptions);
//         return true;
//     }
//     catch (error)
//     {
//         console.error('Error sending invitation email:', error);
//         return false;
//     }
// };

// module.exports = {
//     verifyEmailDomain,
//     generateVerificationToken,
//     sendVerificationEmail,
//     sendGuestInvitationEmail
// };