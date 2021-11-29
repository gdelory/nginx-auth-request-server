# Really basic authentication server for Nginx auth_request module

## Introduction

This is a really basic authentication server using JSON web token, authenticating users against a list of users
set in the config,js file.

I initially wrote this for node-red, because it only supports form authentication for the admin section, but only 
supports HTTP Basic authentication for the dashboard/ui section and I wanted a login form.

Idea was just to hide node-red behind NGinx and to protect it with a simple form setting a JWT cookie.

Of course you can use the auth_request module with any OAuth provide, but I wanted something really simple and quickly running.

## Server setup

As always, clone fro, git or download, and make sure you install the dependencies:

```
npm install --only=prod
```

Password a bcrypt hashed in the config file. To use this, make sure you edit config.js to set you own secret key
to sign the JSON web token. and add your list of users. To hash your password, you can use the pw-hash.js script.

Just run:

```
node ./pw-hash.js <your_password>
```

And it will output the hash value.

You can make sure your server restarts automatically at reboot with pm2:

Install pm2 if not done yet:

```
sudo npm install -g pm2
```

Start the server using pm2, make sure it matches your server's locations:

```
pm2 start /home/pi/auth_server/index.js
```

And save the configuration
```
pm2 save
pm2 startup
```
and follow the configuration set by the startup command

## NGinx setup

To use this with your nginx, add this to your nginx location you want to secure:

```
error_page 401 = @error401;
auth_request /auth;
auth_request_set $new_cookie $sent_http_set_cookie;
add_header Set-Cookie $new_cookie;
```

Then create the auth location which will proxy this basic server internally to nginx:

```
location /auth {
    internal;
    proxy_pass http://127.0.0.1:8079;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
```

Also adds the login location so you can expose the login page to users

```
location /login {
    proxy_pass http://127.0.0.1:8079;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```


And finally, create the error redirect so when this server return 401 (user not authenticated), your users are
redirected to the login page.

```

location @error401 {
    return 302 https://$host:$server_port/login?origin=$scheme://$http_host$request_uri;
}
```


For reference, here is my complete nginx config file for node-red:

```
server {
    listen XXXX ssl default_server;
    listen [::]:XXXX ssl default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;
    ssl_certificate /etc/letsencrypt/live/XXXXXXXXXXXXXXX/cert.pem;
    ssl_certificate_key /etc/letsencrypt/live/XXXXXXXXXXXXXXX/privkey.pem;

    location /login {
        proxy_pass http://127.0.0.1:8079;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        error_page 401 = @error401;
        auth_request /auth;
        auth_request_set $new_cookie $sent_http_set_cookie;
        add_header Set-Cookie $new_cookie;
        proxy_pass http://127.0.0.1:1880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /auth {
        internal;
        proxy_pass http://127.0.0.1:8079;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
    }
    location @error401 {
        return 302 https://$host:$server_port/login?origin=$scheme://$http_host$request_uri;
    }
}
```

