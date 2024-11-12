# Model-Router-Controller Pattern Express.js Blogging Platform Website API

A RESTful API built with Express.js, following the Model-Router-Controller (MRC) pattern, for a mock blogging platform. This application handles user authentication, blogging, commenting, and message-sending functionality.

## Features

-   **User Management:** Registration, login, and profile updates
-   **Blog Management:** Create, update, delete, and comment on blog posts
-   **Admin Dashboard:** Admin users can moderation messages and comments.
-   **Messaging System:** Users can send messages to the admin via a contact form
-   **Logging & Testing:** Integrated logging and testing functionalities
-   **Role-based Authorization:** Specific routes are accessible only to authorized roles

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ronnmabunga/expressjs-mongodb-mrc-blogging-api-demo.git blogging-platform-api
cd blogging-platform-api
```

2. Install dependencies:

```bash
npm install
```

3. Run the application:

```bash
npm run start
```

## Testing

To run tests:

```bash
npm test
```

All tests are located in test/test.js.

## Models

-   **User**: Stores user account information.
-   **Blog**: Stores blog information and associated comments.
-   **Message**: Stores messages sent by users to the admin (reviews, suggestions, etc.).

## Dependencies

### Core Dependencies

-   **express**: Web application framework for Node.js, used to build RESTful APIs.
-   **mongoose**: MongoDB object modeling tool, providing schema-based data modeling and connection management.
-   **bcrypt**: Library for hashing passwords, enhancing security by encrypting sensitive data.
-   **cors**: Middleware to enable Cross-Origin Resource Sharing, allowing your API to handle requests from different origins.
-   **dotenv**: Loads environment variables from a .env file, helping manage configuration securely.
-   **jsonwebtoken**: Implements JSON Web Tokens (JWT) for user authentication.
-   **morgan**: HTTP request logger middleware, used for logging request details.
-   **winston**: Logging library providing various transport options for log management.

### Dev Dependencies

-   **mocha**: Test framework for Node.js, used to run unit and integration tests.
-   **chai**: Assertion library to support a variety of test assertions.
-   **chai-http**: Extends Chai for HTTP integration tests, used to test API endpoints.

## API Routes Overview

### User Routes

-   **GET /** - Retrieve logged-in user details.
-   **PATCH /** - Update logged-in user details.
-   **POST /register** - Register a new user.
-   **POST /login** - Login an existing user.

### Message Routes

-   **GET /** - Admin access to retrieve all messages.
-   **POST /** - Send a "Contact Us" message.
-   **PATCH /:messageId** - Mark a message as read (admin only).

### Blog Routes

-   **GET /** - Retrieve blogs created by the logged-in user.
-   **POST /** - Create a new blog post.
-   **GET /all** - Retrieve all blogs.
-   **GET /:blogId** - Retrieve a specific blog by ID.
-   **POST /:blogId** - Add a comment to a blog post.
-   **PATCH /:blogId** - Update a blog post.
-   **DELETE /:blogId** - Delete a blog post.
-   **PATCH /:blogId/:commentId** - Update a comment.
-   **DELETE /:blogId/:commentId** - Delete a comment

## Sample Registered Credentials

Use these sample users to test the API:

-   **Non-admin User**:

```json
{
    "email": "mainuser@mail.com",
    "password": "pAs$w0rd"
}
```

-   **Admin User**:

```json
{
    "email": "mainadmin@mail.com",
    "password": "pAs$w0rd"
}
```

## Continuous Integration

A GitHub Actions workflow using Docker is set up for continuous integration.

## License

    This project is licensed under the GNU GENERAL PUBLIC LICENSE.
