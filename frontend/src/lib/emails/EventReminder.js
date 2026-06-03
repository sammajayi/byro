export const EventReminder = (name, subject, message, eventName) => {
  return {
    subject: subject || `Reminder: ${eventName}`,
    text: `Hi ${name},\n\n${message}\n\nSee you at ${eventName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007AFF;">${eventName}</h2>
        <p>Hi ${name},</p>
        <p style="white-space: pre-wrap;">${message}</p>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          You are receiving this because you registered for ${eventName}.
        </p>
      </div>
    `,
  };
};
