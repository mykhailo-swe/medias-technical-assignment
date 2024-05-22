# medias-technical-assignment

### Running the App

This guide will walk you through setting up and running the application locally.

### Prerequisites

Before you begin, make sure you have the following installed:

- Node.js and npm (Node Package Manager)
- PostgreSQL Installation

### Clone the repository to your local machine:

`git clone <repository-url>`

Navigate to the project directory:

`cd medias-technical-assignment`

Install dependencies:

`npm install`

### Setting up PostgreSQL

Install PostgreSQL if you haven't already. You can download it from the official website or use a package manager like Homebrew (for macOS) or apt (for Ubuntu).

- Start the PostgreSQL server.

- Create a new database for the application:

`createdb database_name`

Replace database_name with the desired name for your database.

- Update the database configuration:

Open config/config.json and modify the development section with your PostgreSQL credentials.

### Running Migrations

Before running the application, you need to run migrations to set up the database schema.

`npx sequelize-cli db:migrate`

### Running the Application

Once the setup is complete, you can start the application:

`npm run start`

The application should now be running locally. You can access it at http://localhost:3000.

### Additional Notes

Make sure the PostgreSQL server is running before starting the application.

If you encounter any issues during setup or while running the application, refer to the project's documentation or seek assistance from the project maintainers.
