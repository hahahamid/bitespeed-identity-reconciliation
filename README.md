# Bitespeed Identity Reconciliation Service

## Overview

This project implements an Identity Reconciliation service as part of the Bitespeed Backend Task. The service is designed to identify and keep track of a customer's identity across multiple purchases on an e-commerce platform. It consolidates customer contact information, linking related contacts and maintaining a primary-secondary relationship between them.

## Features

- Identifies and links customer contacts based on email and phone number
- Maintains a primary-secondary relationship between linked contacts
- Provides a RESTful API endpoint for identity reconciliation
- Uses PostgreSQL for data persistence

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres) for database interactions

## Setup and Installation

1. Clone the repository:
  ```bash
   git clone https://github.com/your-username/bitespeed-identity.git
   cd bitespeed-identity
   ```   
2. Install dependencies:

```bash
   npm install
  ```


3. Set up your PostgreSQL database and create a `.env` file in the root directory with the following content:


```
DB_USER=your_username
DB_HOST=your_host
DB_NAME=your_database_name
DB_PASSWORD=your_password
DB_PORT=your_port
PORT=3000
```

4. Start the server:

The server will start on `http://localhost:3000` (or the port specified in your .env file).

## API Usage

The service exposes a single endpoint:

```
POST /api/identify
```
Request body:

```json
{
  "email": "example@example.com",
  "phoneNumber": "1234567890"
}
```

Response body:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@example.com", "secondary@example.com"],
    "phoneNumbers": ["1234567890", "9876543210"],
    "secondaryContactIds": [2, 3]
  }
}
```


# How It Works

- When a request is received, the service checks if a primary contact exists with the given email or phone number.
- If no primary contact exists, it creates a new primary contact.
- If a primary contact exists:

- It checks for any existing secondary contacts.
- If a secondary contact exists with different information, it updates the secondary contact.
- If no secondary contact exists but the incoming information is different from the primary, it creates a new secondary contact.


The service then consolidates all linked contacts (primary and secondary) and returns the consolidated information.

