# City Hive Project

This is a full-stack application with an Angular frontend and Ruby on Rails backend.

## Prerequisites

- Node.js (v18 or higher)
- Ruby (v3.2.2)
- Redis
- MongoDB
- Angular CLI (v19.2.11)

## Project Structure

```
city-hive-proj/
├── frontend/     # Angular application
└── backend/      # Ruby on Rails application
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Ruby dependencies:
   ```bash
   bundle install
   ```

3. Set up the database:
   ```bash
   rails db:create
   rails db:migrate
   ```

4. Start the Rails server:
   ```bash
   rails server
   ```
   The backend will be available at `http://localhost:3000`

5. Start Redis / Resque services:
  ```
    redis-server
    QUEUE=* rake environment resque:work rails s
  ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:4200`

## Development

- The frontend is configured to proxy API requests to the backend through `proxy.conf.json`
- Both servers need to be running simultaneously for the application to work properly
- Frontend changes will automatically reload
- Backend changes will require a server restart

## Testing

### Backend Tests
```bash
cd backend
rspec
```


### Accessing Production

https://quiet-treacle-3813ef.netlify.app

## Additional Notes

- Make sure Redis is running for the backend
- The backend uses MongoDB as its database
- Environment variables may need to be configured based on your local setup

### Potential Improvements

# Enhance the login flow
- Setup forgot my password / reset password options
- Login via third part services via oAuth (Google, Github etc.)

# Paginate the backend controller for user messages for more efficient load management on the database

# Format front end strings cleaner
# Add support for mediaURL (attaching files, images, PDFs etc.)

# Add some color to the app to make the front end more visually appealing to end users

# Keep better track of git commits for easier cross team development and logging to troubleshoot potential bugs & future enhancements / features