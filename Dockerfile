FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY src/ src/
COPY public.html public.html
EXPOSE 3000
CMD ["node", "src/index.js"]
