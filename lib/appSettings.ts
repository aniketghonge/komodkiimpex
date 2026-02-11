/**
 * App Settings Configuration
 * Centralized configuration for email and other app settings
 */

export const appSettings = {
  email: {
    smtp: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: 'aniketghonge00@gmail.com',
        pass: 'tnko pxgk ldrp buem', // Gmail App Password
      },
    },
    from: 'aniketghonge00@gmail.com',
    to: 'aniketghonge00@gmail.com',
    displayName: 'Komodki Impex',
  },
  company: {
    name: 'Komodki Impex',
    phone: '+919833964347',
    address: 'Shivneri C-2, Ashok Nager, Dahisar (East), Mumbai - 400068, Maharashtra, India.',
  },
}

export default appSettings
