const nodemailer =  require('nodemailer');

module.exports = {
    sendMail: function() {
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
        var content = '';
        content += `
            <div style="padding: 10px; background-color: #003375">
                <div style="padding: 10px; background-color: white;">
                    <h4 style="color: #0085ff">Gửi mail với nodemailer và express</h4>
                    <span style="color: black">Đây là mail test</span>
                </div>
            </div>
        `;
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'tranleanhvu001@gmail.com',
            to: "tranleanhvu002@gmail.com",
            subject: 'Test Nodemailer',
            text: 'Your text is here',
            html: content //Nội dung html mình đã tạo trên kia :))
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