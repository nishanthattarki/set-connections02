FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other project files
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
