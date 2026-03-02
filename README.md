# mini-wallet-interna
## Mini Wallet System

Sistema básico de billetera digital desarrollado con:

Backend: Node.js + Express + PostgreSQL

Frontend: Vite + React + TailwindCSS

Base de datos: PostgreSQL

Este proyecto permite:

Crear usuarios con una billetera inicial

Manejar balances usando tipo NUMERIC

Transferir fondos entre billeteras (misma moneda)

Visualizar usuarios y billeteras

Listar transferencias
## Estructura del Proyecto
mini-wallet/
│
├── server/      # Backend (Express + PostgreSQL)
└── client/      # Frontend (Vite + React)
🗄️ Configuración de Base de Datos (PostgreSQL)

Asegúrate de tener PostgreSQL instalado y en ejecución.

Crear la base de datos:

CREATE DATABASE mini-wallet-db;

Luego ejecutar el script SQL del esquema (tablas, restricciones, funciones).
## Configuración del Backend
1️⃣ Entrar a la carpeta del servidor
cd server
2️⃣ Instalar dependencias
npm install
3️⃣ Crear archivo .env
PORT=3000

// Ejemplo DB:
*DB_HOST=localhost
*DB_PORT=5432
*DB_USER=postgres
*DB_PASSWORD=pass
*DB_NAME=mini-wallet-db

⚠️ Cambia las credenciales según tu configuración local.

4️⃣ Ejecutar el servidor
npm run dev

El servidor correrá en:

http://localhost:3000

Base de la API:

http://localhost:3000/api

🌐 Configuración del Frontend
1️⃣ Entrar a la carpeta del cliente
cd client
2️⃣ Instalar dependencias
npm install
3️⃣ Ejecutar servidor de desarrollo
npm run dev

El frontend correrá en:

http://localhost:5000
