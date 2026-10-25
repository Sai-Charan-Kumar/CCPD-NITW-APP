# CCPD NITW

A React Native application for the Centre for Career Development at NIT Warangal, built with Expo.

## Current architecture

The application uses a local Version 1 backend in `server/`:

- Express and Mongoose
- MongoDB at `mongodb://localhost:27017/ccpd_v1`
- JWT authentication with bcrypt password hashing
- Role-protected drive and notice administration
- Server-side eligibility validation before applications are saved
- Axios and AsyncStorage on the Expo client

There is no active frontend mock-data path. The database must be running before
the API server or authenticated application flows can be used.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start MongoDB locally.

3. Configure and start the backend

   ```bash
   cd server
   copy .env.example .env
   npm install
   npm start
   ```

4. Start the Expo app from the project root

   ```bash
   npx expo start
   ```

For a physical device, set `EXPO_PUBLIC_API_URL` in the Expo environment to the
backend machine's LAN address, for example
`http://192.168.1.10:5000/api`, instead of `localhost`.

Student accounts can be created through the registration screen. TNP and CCPD
Head accounts should be created directly by an administrator in MongoDB with
roles `tnp` and `head`; public registration intentionally creates students only.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

The application entry point is `App.tsx`, with screens and navigation under `src/`.
The API entry point is `server/server.js`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

### Validation

```bash
npx tsc --noEmit -p tsconfig.json
npm run lint
npx expo export --platform web
node --check server/server.js
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
