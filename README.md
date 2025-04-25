# RezTek - Student Residence Management System

RezTek is a comprehensive student residence management system designed to streamline maintenance requests, stock management, and tenant feedback for student accommodations.

## Features

### Admin Portal
- **Dashboard Overview**
  - Real-time statistics and analytics
  - Quick access to all system modules
  - Residence-based filtering

- **Maintenance Request Management**
  - Track and manage maintenance requests
  - Assign priorities and status updates
  - View request history and details

- **Tenant Management**
  - Manage tenant information
  - Track tenant requests and history
  - Residence allocation

- **Stock Management**
  - Track inventory levels
  - Set minimum quantity alerts
  - Generate stock reports
  - PDF export functionality

- **Feedback System**
  - Collect and analyze tenant feedback
  - Generate feedback reports
  - PDF export functionality

- **Analytics Dashboard**
  - Visual representation of maintenance trends
  - Performance metrics
  - Residence-specific analytics

### Tenant Portal
- **Maintenance Request Submission**
  - Submit new maintenance requests
  - Upload images
  - Track request status

- **Feedback Submission**
  - Rate completed maintenance work
  - Provide detailed feedback
  - View feedback history

## Technical Stack

- **Frontend**
  - Next.js 15
  - React 18
  - TypeScript
  - Tailwind CSS
  - Radix UI Components

- **Backend & Database**
  - Firebase
  - Firestore
  - Firebase Authentication

- **PDF Generation**
  - jsPDF
  - jspdf-autotable

## Environment Setup

Before running the application, you need to set up your environment variables. Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## Firebase Service Account

For server-side Firebase functionality, you'll need to:

1. Generate a service account key from the Firebase Console
2. Save it as `serviceAccountKey.json` in a secure location
3. Add the path to your service account key in your `.env.local` file

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account and project setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reztek.git
   cd reztek
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## PDF Generation Features

### Stock Inventory PDF
- Comprehensive stock item listing
- Quantity tracking
- Minimum quantity alerts
- Summary statistics
- Last updated timestamps

### Feedback Report PDF
- Detailed feedback records
- Rating analysis
- Request correlation
- Summary statistics
- Date-based filtering

## Security Features

- Firebase Authentication
- Role-based access control
- Secure data storage
- Input validation
- Protected routes

## Security Notes

- Never commit your `.env.local` file or `serviceAccountKey.json` to version control
- Keep your Firebase credentials and service account keys secure
- The `.gitignore` file is configured to prevent sensitive files from being committed

## Development Guidelines

1. Always use environment variables for sensitive information
2. Don't store API keys or secrets in the codebase
3. Use secure practices when handling user data

## Deployment

When deploying:
1. Set up environment variables in your hosting platform
2. Ensure service account keys are securely stored
3. Verify all sensitive information is properly protected

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@reztek.com or open an issue in the repository.

## Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the robust backend services
- All contributors who have helped shape this project
