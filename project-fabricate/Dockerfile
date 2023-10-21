# Use the official Node.js image as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

RUN npm install -g serve

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app
RUN npm run build

# Define the command to run your app using 'npm start'
CMD ["serve", "-s", "build", "-l", "3000"]
