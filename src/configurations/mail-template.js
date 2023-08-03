function emailTemplate(userName, access_code, expiredAt = 15) {
	return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              padding: 20px;
            }
  
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              padding: 20px;
            }
  
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
  
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #333333;
            }
  
            .content {
              margin-bottom: 20px;
            }
  
            .access-code {
              font-size: 18px;
              font-weight: bold;
              color: #333333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Welcome, ${userName}!</h1>
            </div>
            <div class="content">
              <p>Your access code is:</p>
              <h2 class="access-code">${access_code}</h2>
              <p>Access token expires in ${expiredAt} minutes.</p>
            </div>
          </div>
        </body>
      </html>
    `;
}

module.exports = { emailTemplate };
