const nodemailer =  require('nodemailer');

module.exports = {
    sendVerifyCode: async function(to, subject, content) {
        var transporter =  nodemailer.createTransport({ 
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'tranleanhvu001@gmail.com',
                pass: 'TranLeAnhVu1999@'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        var mainOptions = { 
            from: 'tranleanhvu001@gmail.com',
            to,
            subject,
            text: 'Your text is here',
            html: content 
        }
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' +  info.response);
            }
        });
    }
} 