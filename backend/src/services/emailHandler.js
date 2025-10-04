import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
    },
});

export const sendPasswordEmail = async (userEmail, password) => {
    const mailOptions = {
        from: process.env.USER,
        to: userEmail,
        subject: "Your ExpenseFlow Account Credentials",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f8fa; padding: 30px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
              <div style="background-color: #2563eb; color: white; text-align: center; padding: 20px 0;">
                <h1 style="margin: 0; font-size: 24px;">ExpenseFlow</h1>
              </div>
              <div style="padding: 25px;">
                <p style="font-size: 16px; color: #333;">Hello,</p>
                <p style="font-size: 15px; color: #444;">
                  Below are your login credentials for your <strong>ExpenseFlow</strong> account.
                  Please use the same email address this message was sent to when signing in.
                </p>
    
                <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="font-size: 15px; color: #111; margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
                  <p style="font-size: 15px; color: #111; margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                </div>
    
                <p style="font-size: 15px; color: #444;">
                  You can log in anytime using the button below.
                </p>
    
                <div style="text-align: center; margin-top: 25px;">
                  <a href="https://expenseflow.com/login" style="background-color: #2563eb; color: white; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 500;">
                    Go to Login
                  </a>
                </div>
    
                <p style="font-size: 13px; color: #777; margin-top: 30px;">
                  For your security, do not share your credentials with anyone. If you didn’t request this information, please contact ExpenseFlow support immediately.
                </p>
    
                <p style="font-size: 13px; color: #777; margin-top: 10px;">
                  — The ExpenseFlow Team
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Hello,
    
    Below are your ExpenseFlow account credentials.
    
    Email: ${userEmail}
    Password: ${password}
    
    Please log in using this email address. 
    For your security, do not share these credentials with anyone.
    
    - The ExpenseFlow Team`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password sent to email:", userEmail);
    } catch (error) {
        console.error("Error sending password email:", error);
        throw error;
    }
};
