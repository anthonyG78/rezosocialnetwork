module.exports  = function(context){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${context.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
        table {
            font-family: Arial, Helvetica;
        }
        thead, tfoot {
            color: white;
        }
        thead {
            background-color: #009688;
        }
        thead a {
            text-decoration: none;
        }
        tfoot {
            font-size: 12px;
            background-color: #3e2723;
            padding: 10px;
        }
        thead a, tfoot a {
            color: white;
        }
        
    </style>
</head>
<body>
    <table cellpadding="0" cellspacing="0" border=0 width="600">
        <thead>
            <td>
                <table cellpadding="20" cellspacing="0" border=0>
                    <tr>
                        <td>
                            <h1>
                                <a style="color:white; text-decoration:none;" href="${context.app.url}">${context.app.name}</a>
                            </h1>
                        </td>
                    </tr>
                </table>
            </td>
        </thead>
        <tr>
            <td style="background-color: #EEEEEE">
                <table cellpadding="20" cellspacing="0" border=0 width="100%">
                    <tr>
                        <td>
                            <p>Bonjour ${context.user.username},<br>
                            Y a du nouveau dans la zone !</p>
                            <p>
                                <a href="${context.app.url}/profil/${context.sender._id}" style="color:white; text-decoration:none;"><img src="${context.sender.avatar}&s=32" style="vertical-align: middle; margin-right: 5px"/></a>
                                <a href="${context.app.url}/profil/${context.sender._id}" style="color:black; text-decoration:none;"><span><b>${context.sender.username}</b></span></a>
                                <span>${context.notification}</span>
                            </p>
                            <div style="background:white; padding:20px">
                                <p><i>${context.message}</i></p>
                                <a href="${context.action.url}" style="display:inline-block; padding:10px;background-color:#009688; color: white;text-decoration: none">${context.action.label}</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <small style="color: #AAAAAA">Cet email a été envoyé par un automate, veuillez ne pas y répondre.</small>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tfoot>
            <td>
                <table cellpadding="20" cellspacing="0" border=0 width="100%">
                    <tr>
                        <td>
                            2017
                        </td>
                    </tr>
                </table>
            </td>
        </tfoot>
    </table>
</body>
</html>`;
};