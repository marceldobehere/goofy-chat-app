mkdir data/ssl -p
# Change this to your domain yes
cp /etc/letsencrypt/live/goofy.marceldobehere.com/fullchain.pem data/ssl/cert.pem
cp /etc/letsencrypt/live/goofy.marceldobehere.com/privkey.pem data/ssl/key.pem

if [ ! -f data/users.json ]; then
    echo "[]" > data/users.json
fi

node index.js