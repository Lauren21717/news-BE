# NC News API

A RESTful API for a news website with articles, comments, topics, and user management.

## Getting Started

### Prerequisites

- Node.js  
- PostgreSQL

### Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/Lauren21717/news-BE.git
    cd news-BE
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

### Database Setup

This project requires two PostgreSQL databases: one for development and one for testing.

#### 1. Create the Databases

Run the setup script to create both databases:

```bash
npm run setup-dbs
```

### 2. Environment Variables

You must create two `.env` files in the root directory to connect to your databases:

- `.env.development`

    ```ini
    PGDATABASE=nc_news
    ```

- `.env.test`

    ```ini
    PGDATABASE=nc_news_test
    ```

> **Note:** These `.env` files are ignored by Git for security reasons. Each developer needs to create their own locally.

### 3. Seed the Development Database

Populate the development database with data:

```bash
npm run seed-dev
```