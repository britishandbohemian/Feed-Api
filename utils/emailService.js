import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.validateConfig();

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: true
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000
        });
    }

    validateConfig() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Missing email configuration. Set EMAIL_USER and EMAIL_PASSWORD in .env');
        }
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('SMTP connection verified');
            return true;
        } catch (error) {
            console.error('SMTP connection failed:', error.message);
            throw new Error('Email service unavailable');
        }
    }

    async sendEmail(options) {
        try {
            const requiredFields = ['to', 'subject', 'text'];
            const missing = requiredFields.filter(field => !options[field]);

            if (missing.length > 0) {
                throw new Error(`Missing required fields: ${missing.join(', ')}`);
            }

            const mailOptions = {
                from: `"${process.env.APP_NAME || 'Task Manager'}" <${process.env.EMAIL_USER}>`,
                ...options,
                html: options.html || options.text
            };

            await this.verifyConnection();
            return await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Email send error:', error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendOtpEmail(email, otp) {
        if (!email || !otp) throw new Error('Missing email or OTP');

        return this.sendEmail({
            to: email,
            subject: 'Your Verification Code',
            text: `Your OTP is: ${otp}\nValid for 10 minutes.`,
            html: `
                <div style="font-family: Arial, max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Task Manager Verification</h2>
                    <p>Your verification code:</p>
                    <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #666;">Expires in 10 minutes</p>
                </div>
            `
        });
    }

    async sendVerificationEmail(email, verificationUrl) {
        return this.sendEmail({
            to: email,
            subject: 'Verify Your Email',
            text: `Verify your email: ${verificationUrl}`,
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <a href="${verificationUrl}" style="
                        background: #3498db; 
                        color: white; 
                        padding: 12px 24px;
                        display: inline-block;
                        text-decoration: none;
                        border-radius: 4px;
                    ">Verify Email</a>
                </div>
            `
        });
    }

    async sendPasswordResetEmail(email, resetUrl) {
        return this.sendEmail({
            to: email,
            subject: 'Password Reset Request',
            text: `Reset your password: ${resetUrl}`,
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset</h2>
                    <a href="${resetUrl}" style="
                        background: #e74c3c;
                        color: white;
                        padding: 12px 24px;
                        display: inline-block;
                        text-decoration: none;
                        border-radius: 4px;
                    ">Reset Password</a>
                </div>
            `
        });
    }
}

export default new EmailService();