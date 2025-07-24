# Demo Front

An Angular-based admin dashboard featuring user management, product management, and role-based access control.

## Features

- **Authentication**
  - Login with username/password
  - JWT token-based authentication
  - Protected routes with role-based guards

- **User Management**
  - View users in a table format
  - Create, edit, and delete users
  - Export user data to PDF and Excel
  - Fields: name, username, email, phone, roles

- **Product Management**
  - View products in a table format
  - Create, edit, and delete products
  - Export product data to PDF and Excel
  - Fields: code, name, brand, price

- **Role Management**
  - View roles in a table format
  - Create, edit, and delete roles
  - Export role data to PDF and Excel

## Prerequisites

- Node.js (v18 or higher)
- Angular CLI
- Backend API running on `http://localhost:8000`

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd demo-front
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Navigate to `http://localhost:4200` in your browser

## Project Structure

```
src/
├── app/
│   ├── auth/           # Authentication components
│   ├── guards/         # Route guards
│   ├── services/       # API services
│   └── shared/         # Shared components
├── assets/            # Static files
└── environments/      # Environment configurations
```

## API Integration

The application connects to a backend API at `http://localhost:8000` with the following endpoints:

- `/api/login` - Authentication
- `/api/v1/users` - User management
- `/api/v1/products` - Product management
- `/api/v1/roles` - Role management

## Building for Production

To create a production build:

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
