# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# URL de la API que queda "pegada" en el bundle de producción
ARG API_URL=http://localhost:8000/api
RUN sed -i "s#http://localhost:8000/api#${API_URL}#" src/environments/environment.ts \
 && npx ng build --configuration production

# ---- runtime ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend-angular/browser /usr/share/nginx/html
EXPOSE 80
