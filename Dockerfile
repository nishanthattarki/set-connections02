FROM nginx:alpine

# Copy all files from the current directory into Nginx's serving directory
COPY . /usr/share/nginx/html

# Expose port 80 for Railway to route traffic
EXPOSE 80
