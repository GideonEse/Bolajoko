# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this application on your local machine, follow these steps:

### 1. Install Dependencies

First, install the necessary Node.js packages:

```bash
npm install
```

### 2. Set Up Environment Variables

The application uses Genkit with the Google AI provider, which requires an API key.

1.  Create a file named `.env` in the root of the project.
2.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key.
3.  Add the following line to your `.env` file, replacing `YOUR_API_KEY` with the key you just created:

```
GOOGLE_API_KEY=YOUR_API_KEY
```

### 3. Run the Development Servers

You need to run two separate processes in two different terminal windows: one for the AI backend (Genkit) and one for the web frontend (Next.js).

**Terminal 1: Start the Genkit Server**

This command starts the Genkit flows that handle AI-powered features like receipt verification.

```bash
npm run genkit:dev
```

**Terminal 2: Start the Next.js Server**

This command starts the main web application.

```bash
npm run dev
```

### 4. Access the Application

Once both servers are running, you can open your browser and navigate to:

[http://localhost:9002](http://localhost:9002)

You should now see the application's login page.
