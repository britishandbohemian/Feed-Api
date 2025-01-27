import nodemailer from 'nodemailer';
import { config } from '../config.js';

class EmailService {
    constructor() {
        // Validate environment variables first
        this.validateConfig();
        
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "Kamogelomosiah@gmail.com",
                pass: "hymjndnkyxyqrpol",
            },
            tls: {
                rejectUnauthorized: false
            },
            // Add timeout to avoid hanging
            connectionTimeout: 5000,
            greetingTimeout: 5000
        });
    }

    validateConfig() {
        if (!config.EMAIL_USER || !config.EMAIL_PASSWORD) {
            throw new Error('Email configuration missing. Check EMAIL_USER and EMAIL_PASSWORD in .env');
        }
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('SMTP connection successful');
        } catch (error) {
            console.error('SMTP connection failed:', error.message);
            throw new Error('Failed to connect to email service');
        }
    }

    async sendEmail(options) {
        try {
            if (!options.to || !options.subject) {
                throw new Error('Missing required email fields');
            }

            const mailOptions = {
                from: `"${config.APP_NAME || 'Your App'}" <${config.EMAIL_USER}>`,
                ...options,
                html: options.html ? options.html.trim() : undefined
            };

            await this.verifyConnection();
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            const errorMessage = `Email sending failed: ${error.message}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async sendVerificationEmail(user, verificationUrl) {
        if (!user?.email || !verificationUrl) {
            throw new Error('Missing user email or verification URL');
        }

        return this.sendEmail({
            to: user.email,
            subject: 'Verify Your Email',
            text: `Click on the link to verify your email: ${verificationUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome!</h2>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${verificationUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        If you did not create an account, please ignore this email.
                    </p>
                </div>
            `
        });
    }

    async sendPasswordResetEmail(user, resetUrl) {
        if (!user?.email || !resetUrl) {
            throw new Error('Missing user email or reset URL');
        }

        return this.sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click on the link to reset your password: ${resetUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset</h2>
                    <p>You have requested a password reset.</p>
                    <a href="${resetUrl}" 
                       style="background-color: #2196F3; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        If you did not request this reset, please ignore this email.
                    </p>
                </div>
            `
        });
    }
}

export default new EmailService();
