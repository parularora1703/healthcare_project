# 1. Use the official Node.js image as the base
FROM node:18

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the package.json file and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of your backend code into the container
COPY . .

# 5. Expose the port your app will run on (usually 5000 for backend)
EXPOSE 5000

# 6. Define the command to run your app inside the container
CMD ["npm", "start"]
