# Sourdough Bakery Timer and Process Management System

A modern, real-time bakery management system designed specifically for sourdough production workflows. Built with React Native and Expo, this app helps bakers coordinate their production schedules, manage multiple doughs simultaneously, and maintain consistent quality through precise timing and documentation.

![Bakery App Banner](./assets/icon.png)

## Features

### Recipe Management
- Create and store sourdough recipes with baker's percentages
- Calculate hydration levels automatically
- Track ingredients and mixing instructions
- Generate automated timelines

### Dough Tracking
- Track multiple doughs simultaneously (5-8 doughs)
- Color-code different doughs for easy identification
- Monitor real-time status updates
- Record temperature readings at various stages
- Receive overproofing alerts

### Process Timeline
- Sequential timer system for each stage:
  - Mixing
  - Autofermentation/rest
  - Folding (1st, 2nd, 3rd, 4th folds)
  - Bulk fermentation
  - Pre-shape
  - Final shaping
  - Final proof
  - Baking
- Manual stage confirmation for quality control

### Documentation
- Note-taking capability throughout the process
- Record temperature logs with timestamps
- Document issues and observations
- Track production batches

## Getting Started

### Prerequisites
- Node.js (14.x or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (for database)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/comthre3/bakery-timer-app.git
   cd bakery-timer-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database
   Follow the instructions in [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) to set up the Supabase database schema.

5. Start the Expo development server
   ```bash
   npx expo start
   ```

## Database Setup

This app uses Supabase as its backend database. Before using the app, you need to set up the database tables. Detailed instructions are provided in the [Database Setup Guide](./docs/DATABASE_SETUP.md).

## Technical Stack

- **Frontend**: React Native with Expo
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **Navigation**: Expo Router
- **Offline Support**: AsyncStorage for local caching

## Project Structure

```
bakery-timer-app/
├── app/                     # Main application code (Expo Router)
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main tab screens
│   │   ├── index.js         # Dashboard screen
│   │   ├── recipes.js       # Recipes list screen
│   │   ├── recipes/         # Recipe-related screens
│   │   ├── doughs.js        # Doughs list screen
│   │   ├── doughs/          # Dough-related screens
│   │   └── profile.js       # User profile screen
│   └── _layout.js           # Root layout with navigation setup
├── src/                     # Source code
│   ├── services/            # Backend services
│   │   └── supabase.js      # Supabase client configuration
│   └── components/          # Reusable components
├── assets/                  # Static assets
├── docs/                    # Documentation
│   ├── DATABASE_SETUP.md    # Database setup guide
│   └── setup-database.sql   # SQL script for database setup
└── README.md                # Project documentation
```

## Features to be Implemented

- User management with role-based access
- Analytics for dough success rate and production efficiency
- Multi-language support
- Temperature sensor integration
- Push notifications for stage completions
- Offline-first capability with full sync

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the bakers who provided input on the process management workflow
- Inspired by traditional bakery production scheduling systems