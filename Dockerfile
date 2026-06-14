FROM nginx:alpine

# Copy custom Nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy all files from the current directory into Nginx's serving directory
COPY . /usr/share/nginx/html

# Expose port 80 (Railway will override this with its own port, but it's good practice)
EXPOSE 80
