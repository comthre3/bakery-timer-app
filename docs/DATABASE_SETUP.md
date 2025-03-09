# Database Setup for Bakery App

This document explains how to set up the database for the Bakery app.

## Setting Up Supabase Tables

The app needs several tables to be created in your Supabase project. Follow these steps to set them up:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/) and select your project.

2. Go to the SQL Editor by clicking on "SQL Editor" in the left sidebar.

3. Create a new query by clicking on the "+" button.

4. Copy the entire contents of the `setup-database.sql` file in this directory.

5. Paste the SQL code into the SQL Editor.

6. Click "Run" to execute the SQL commands.

7. Verify that the tables were created by going to "Table Editor" in the left sidebar. You should see the following tables:
   - `recipes`
   - `dough_batches`
   - `process_stages`

## Troubleshooting

If you encounter any issues:

1. **Permission errors**: Make sure your Supabase user has the necessary permissions to create tables.

2. **SQL errors**: Check the error messages in the SQL Editor for specific syntax issues.

3. **Connection issues**: Ensure your app is correctly configured with the Supabase URL and API key.

4. **Row Level Security (RLS) issues**: The SQL script sets up RLS policies. If you're having trouble with permissions, you might need to adjust these policies.

## Local Caching

The app is designed to work even when the database connection is unavailable:

- Recipes are cached locally when they're created or fetched.
- If the app can't connect to Supabase, it will use the local cache as a fallback.
- When the connection is restored, the app will try to sync local data with the database.

## Data Model

For reference, here's the basic data model:

- **recipes**: Stores recipe information, including ingredients and baking timeline.
- **dough_batches**: Tracks individual dough batches created from recipes.
- **process_stages**: Records the stages each dough batch goes through.