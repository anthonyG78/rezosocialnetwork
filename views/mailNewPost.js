module.exports  = function(context){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${context.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
        table {
            max-width: 600px;
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
    <table cellpadding="0" cellspacing="0" border=0>
        <thead>
            <td>
                <table cellpadding="10" cellspacing="10" border=0>
                    <tr>
                        <td>
                            <h1><a href="${context.app.url}">REZO</a></h1>
                        </td>
                    </tr>
                </table>
            </td>
        </thead>
        <tr>
            <td style="background-color: #EEEEEE">
                <table cellpadding="10" cellspacing="10" border=0>
                    <tr><td></td></tr>
                    <tr>
                        <td>
                            <p>Bonjour ${context.user.username},<br>
                            Y a du nouveau dans votre espace !</p>
                            <p>${context.sender.username} a publié un post</p>
                            <a href="${context.app.url}/post/${context.post.id}" style="display:inline-block; padding:10px;background-color:#009688; color: white;text-decoration: none">voir le post</a>
                        </td>
                    </tr>
                    <tr><td></td></tr>
                </table>
            </td>
        </tr>
        <tfoot>
            <td>
                <table cellpadding="10" cellspacing="10" border=0>
                    <tr>
                        <td>
                            REZO 2017
                        </td>
                    </tr>
                </table>
            </td>
        </tfoot>
    </table>
</body>
</html>`;
};