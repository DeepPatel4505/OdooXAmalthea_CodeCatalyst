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
        subject: "Password Reset",
        text: `Your password is: ${password}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password sent to email:", userEmail);
    } catch (error) {
        console.error("Error sending password email:", error);
        throw error;
    }
};

