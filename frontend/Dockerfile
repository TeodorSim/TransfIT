FROM nginx:alpine
# Copy your local frontend folder into the Nginx html directory inside the container
COPY . /usr/share/nginx/html
#commented out because we want to use the nginx.conf from the host machine, which is mounted as a volume in docker-compose.override.yml
# to work on localhost
COPY nginx.conf /etc/nginx/conf.d/default.conf
