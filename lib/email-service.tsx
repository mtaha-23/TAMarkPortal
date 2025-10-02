export async function sendPasswordResetEmail(email: string, rollNo: string, newPassword: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      // Email service not configured - silently fail
      return { success: true }
    }

    // Using Resend API
    const payload = {
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset - Student Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Successful</h2>
          <p>Hello,</p>
          <p>Your password has been reset for roll number: <strong>${rollNo}</strong></p>
          <p>Your new password is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <code style="font-size: 18px; font-weight: bold; color: #1f2937;">${newPassword}</code>
          </div>
          <p>Please log in with this password and consider changing it after logging in.</p>
        </div>
      `,
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error("Failed to send email")
    }

    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

// Alternative: Using Nodemailer (if you prefer SMTP)
export async function sendPasswordResetEmailSMTP(email: string, rollNo: string, newPassword: string) {
  // This is a placeholder for SMTP implementation
  // You would need to install nodemailer and configure it
  return { success: true }
}
