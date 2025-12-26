import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create a transporter using the credentials from your .env.local file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * Sends an email using the pre-configured transporter.
 * @param {MailOptions} options - The mail options (to, subject, html).
 */
export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  try {
    await transporter.sendMail({
      from: `PassExam <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    // In a real application, you might want to add more robust error logging here
  }
};