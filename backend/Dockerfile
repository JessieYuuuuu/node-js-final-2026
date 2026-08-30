# 使用已經裝好 Node.js 24 的輕量 Linux
FROM node:24-alpine3.22

# 容器裡的工作目錄
WORKDIR /app

# 先複製套件清單
COPY package.json package-lock.json ./

# 安裝正式環境套件
RUN npm ci --omit=dev

# 複製 backend 裡其餘程式
COPY . .

# 說明後端使用 8080
EXPOSE 8080

# 容器啟動時執行 npm start
CMD ["npm", "start"]