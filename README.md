# Book API

A RESTful API for managing books, built with Node.js, Express.js, and PostgreSQL.

## Features

-   Create, read, update, and delete books.
-   Search, pagination, and sorting.
-   File uploads for book covers.
-   Real-time updates using WebSockets.
-   Role-based access control (RBAC) with OAuth 2.0 and JWT.
-   Advanced API testing with Pact.
-   Performance optimization (Redis caching, load balancing, CDN).
-   Cloud infrastructure deployment with Terraform.
-   CI/CD pipeline with GitHub Actions.
-   Database Optimization.
-   Advanced API monitoring.
-   **Webhooks:** Real-time notifications for book events.
-   **GraphQL API:** Flexible data retrieval and manipulation.
-   **API Versioning:** Support for multiple API versions (v1, v2).
-   **Enhanced API Security:** Input validation, output encoding, and rate limiting.

## Technologies

-   Node.js
-   Express.js
-   PostgreSQL
-   Redis
-   RabbitMQ
-   Docker
-   Terraform
-   AWS (ECS, ECR, ELB, RDS, Elasticache, CloudFront, CloudWatch)
-   GitHub Actions
-   Pact
-   Joi
-   Bee-queue
-   Socket.io
-   GraphQL
-   express-graphql
-   express-rate-limit
-   redis
-   escape-html
-   axios

## Prerequisites

-   Node.js (v18 or higher)
-   PostgreSQL
-   Redis
-   RabbitMQ
-   Docker
-   AWS account (if deploying to AWS)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd book-api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    -   Create a `.env.development` file in the project root.
    -   Set the following environment variables:

        ```
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_HOST=localhost
        DB_PORT=5432
        DB_DATABASE=book_api_dev
        JWT_SECRET=your_jwt_secret
        REDIS_HOST=localhost
        REDIS_PORT=6379
        RABBITMQ_URL=amqp://localhost
        ```

4.  **Run database migrations:**

    ```bash
    npx node-pg-migrate
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    ```

6.  **Access the API:**

    -   The API will be available at `http://localhost:3000`.

## API Endpoints

-   **v1:**
    -   `GET /v1/books`: Get all books (with search, pagination, and sorting).
    -   `GET /v1/books/:id`: Get a specific book.
    -   `POST /v1/books`: Create a new book (admin only).
    -   `PUT /v1/books/:id`: Update a book (admin only).
    -   `DELETE /v1/books/:id`: Delete a book (admin only).
    -   `GET /v1/webhooks`: Get all webhooks.
    -   `POST /v1/webhooks`: Create a new webhook.
    -   `DELETE /v1/webhooks/:id`: Delete a webhook.
-   **v2:** (Includes all v1 endpoints with additional `publication_date` field)
    -   `GET /v2/books`: Get all books (with search, pagination, and sorting).
    -   `GET /v2/books/:id`: Get a specific book.
    -   `POST /v2/books`: Create a new book (admin only).
    -   `PUT /v2/books/:id`: Update a book (admin only).
    -   `DELETE /v2/books/:id`: Delete a book (admin only).
-   `/graphql`: GraphQL API endpoint.
-   `/health`: API health check.

## Testing

-   To run the tests:

    ```bash
    npm test
    ```

-   To run Pact tests:

    ```bash
    npm test
    ```

## Deployment

-   Deployment instructions will be added later (AWS ECS, Terraform, GitHub Actions).

## Contributing

-   Contributions are welcome! Please submit a pull request.

## License

-   [MIT](LICENSE)