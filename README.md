# Reserve-Ease

Reserve-Ease is a comprehensive space reservation management system built with modern web technologies. It allows users to browse, book, and manage reservations for various spaces (such as meeting rooms, event venues, or coworking areas), while providing administrators with powerful tools to oversee operations, handle payments, generate invoices, and analyze usage data.

## Features

### For Users
- **User Authentication**: Secure login and registration using Supabase Auth.
- **Space Browsing**: View available spaces with details like capacity, amenities, and pricing.
- **Reservation Management**: Book spaces for specific dates and times, view booking history, and cancel/modify reservations.
- **Payments Integration**: Seamless payment processing via M-Pesa STK Push for instant mobile payments.
- **Invoice Generation**: Automatic PDF invoice generation and email delivery upon reservation confirmation.
- **Dashboard**: Personalized dashboard to track reservations, payments, and account details.

### For Administrators
- **Admin Panel**: Dedicated interface for managing spaces, users, and reservations.
- **Space Management**: Add, edit, or remove spaces with customizable attributes.
- **Analytics Dashboard**: View detailed analytics on reservations, revenue, and user activity.
- **Payment Tracking**: Monitor payment statuses and handle refunds or disputes.
- **Invoice Management**: Generate and send invoices, track payment history.
- **User Management**: View and manage user accounts and permissions.

### Additional Features
- **Real-time Notifications**: Email confirmations for reservations and payments via Supabase Edge Functions.
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS and Shadcn/ui components.
- **Secure API**: RESTful API powered by Supabase with Row Level Security (RLS) policies.
- **Testing**: Unit and integration tests using Vitest.

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite for build tooling.
- **Styling**: Tailwind CSS with Shadcn/ui component library.
- **Backend**: Supabase (PostgreSQL database, Auth, Edge Functions, Storage).
- **Payments**: M-Pesa API integration for mobile payments.
- **Deployment**: Can be deployed to Vercel, Netlify, or any static hosting with Supabase backend.
- **Development Tools**: ESLint, Vitest, PostCSS.

## Prerequisites

Before setting up the project locally, ensure you have the following installed on your PC:

1. **Node.js**: Version 18 or higher. Download from [nodejs.org](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm) for version management.
   - Verify installation: `node --version` and `npm --version`.
2. **Git**: For cloning the repository. Download from [git-scm.com](https://git-scm.com/).
   - Verify installation: `git --version`.
3. **Supabase CLI**: For local development and database management.
   - Install via npm: `npm install -g supabase` or follow [Supabase CLI docs](https://supabase.com/docs/guides/cli/getting-started).
   - Verify installation: `supabase --version`.
4. **A Code Editor**: Such as Visual Studio Code (recommended) with extensions for TypeScript and React.
5. **Supabase Account**: Sign up at [supabase.com](https://supabase.com/) for a free account to host the backend.

## Installation and Setup

Follow these steps to set up Reserve-Ease on your local machine. This guide assumes you're on Windows (based on your environment), but the steps are similar for macOS/Linux with minor path adjustments.

### Step 1: Clone the Repository
1. Open your terminal (Command Prompt, PowerShell, or Git Bash).
2. Navigate to the directory where you want to store the project (e.g., `cd D:\Projects`).
3. Clone the repository:
   ```
   git clone <YOUR_GIT_REPOSITORY_URL>
   ```
   Replace `<YOUR_GIT_REPOSITORY_URL>` with the actual URL of your repository (e.g., from GitHub).
4. Navigate into the project directory:
   ```
   cd reserve-ease
   ```

### Step 2: Install Dependencies
1. Ensure you're in the project root directory (`D:\system\reserve-ease` or wherever you cloned it).
2. Install all required Node.js packages:
   ```
   npm install
   ```
   This may take a few minutes. If you encounter permission errors, try running as administrator or use `npx` for commands.

### Step 3: Set Up Supabase
1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com/) and log in.
   - Click "New Project" and fill in the details (name: "Reserve-Ease", database password, etc.).
   - Wait for the project to be created (this can take 2-3 minutes).

2. **Link Your Local Project to Supabase**:
   - In your terminal, log in to Supabase CLI (if not already done):
     ```
     npx supabase login
     ```
     Follow the prompts to authenticate via browser.
   - Get your project reference (ref) from the Supabase dashboard (Settings > General > Project ID, e.g., `ownacpshdrkwsfwiheau`).
   - Link the project:
     ```
     npx supabase link --project-ref YOUR_PROJECT_REF
     ```
     Replace `YOUR_PROJECT_REF` with your actual project ID.

3. **Push the Database Schema**:
   - Apply the migrations to set up tables, functions, and policies:
     ```
     npx supabase db push
     ```
     Confirm when prompted. This will create the database structure based on the SQL files in `supabase/migrations/`.

4. **Start Supabase Locally (Optional for Development)**:
   - For local development with a local Supabase instance:
     ```
     npx supabase start
     ```
     This starts local services (database, auth, etc.) on `http://localhost:54321`.
   - Note: For production, you'll use the cloud project. Local is useful for testing without affecting live data.

### Step 4: Configure Environment Variables
1. Create a `.env` file in the project root:
   ```
   # Create the file manually or via command: type nul > .env
   ```
2. Open `.env` in your code editor and add the following (replace with your Supabase project details from Dashboard > Settings > API):
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY
   ```
   - `VITE_SUPABASE_URL`: The project URL (e.g., `https://ownacpshdrkwsfwiheau.supabase.co`).
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: The public/anon key (safe to expose in frontend).
3. **Important**: Do not commit `.env` to Git. Ensure it's in `.gitignore` (it should be by default).

### Step 5: Run the Application
1. Start the development server:
   ```
   npm run dev
   ```
   - This launches Vite's dev server. Open the URL shown (usually `http://localhost:5173`) in your browser.
2. Test the app:
   - Register/login as a user.
   - Try booking a space (you may need to add sample spaces via the admin panel).
   - Access the admin panel at `/admin` (requires admin role; set via Supabase Auth policies).

### Step 6: Additional Setup for Full Functionality
- **M-Pesa Integration**: For payments, configure M-Pesa credentials in Supabase Edge Functions (`supabase/functions/mpesa-stk-initiate/index.ts`). You'll need M-Pesa API keys from Safaricom.
- **Email Notifications**: Supabase handles emails via functions; ensure your project has SMTP configured if needed.
- **Sample Data**: Populate the database with test spaces/users via Supabase Dashboard > SQL Editor.
- **Testing**: Run tests with `npm run test` (using Vitest).

## Usage

- **As a User**: Browse spaces, make reservations, view invoices.
- **As an Admin**: Log in, manage spaces/reservations via the admin tabs.
- **Development**: Use `npm run build` to create a production build, then deploy to your hosting platform.

## Troubleshooting

- **Build Errors**: Ensure Node.js version is 18+. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`.
- **Supabase Issues**: Run `npx supabase status` to check local services. For cloud, verify project ref and keys.
- **Environment Variables**: Restart your dev server after updating `.env`.
- **Ports in Use**: If port 5173 is busy, Vite will suggest an alternative.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make changes and test locally.
4. Commit: `git commit -m "Add your feature"`.
5. Push and create a pull request.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Support

For issues or questions, open a GitHub issue or contact the maintainers.
- Edit files directly within the Codespace and commit and push your changes once you're done.




"# Dynamic-and-billing-system" 
