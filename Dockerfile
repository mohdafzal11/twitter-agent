FROM node@sha256:14e3e539464a5a77bb5fd8f613cbd54d1842a900e7f4ce06f47e42f6a89a83e4

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose port 8080
EXPOSE 3000

# Start the app
CMD npm run start
