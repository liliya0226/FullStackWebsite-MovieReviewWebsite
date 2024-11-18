# MovieIQ: A Modern Movie Review Platform

## Overview
**MovieIQ** is a web platform designed for movie enthusiasts to share, read, and manage reviews for the latest films. The platform offers a user-centric experience, enabling seamless browsing of movie details, reading reviews, and interacting with the content through user authentication. With a focus on accessibility, responsiveness, and secure user interactions, MovieIQ serves as an engaging community space for film aficionados.

### Deployment Link
[Access MovieIQ](https://client-six-amber.vercel.app/)

### Demo Video
[Watch the Demo](https://www.youtube.com/watch?v=PcklbgAV8nw)

## Key Features
- **Dynamic Homepage**: Showcases the latest and top-rated movies using real-time data from the TMDB API. The homepage adapts based on user authentication status, displaying personalized recommendations and content.
- **Movie Search and Detail Viewing**: Both authenticated and non-authenticated users can search for movies and view comprehensive details, including trailers, synopses, and ratings. This ensures that all users have access to essential movie information without needing to log in.
- **Review Management**: Authenticated users can create, edit, and delete their reviews. Reviews are visible to all users, fostering a vibrant community.
- **Favorites Management**: Users can add movies to their favorites list for quick access and remove them as needed.
- **User Authentication**: Secure login and registration powered by Auth0, enabling safe and seamless access to advanced features.
- **Profile Page**: A personalized space where users can view and update their information and see their activity history, including submitted reviews and favorite movies.
- **Responsive Design**: Optimized for use on any device, from desktop computers to tablets and smartphones.
- **External API Integration**: Real-time movie data sourced from TMDB ensures users receive the most up-to-date movie information.

## API Capabilities
- **RESTful API for Reviews**: Supports full CRUD operations, enabling users to manage their reviews efficiently.
- **Favorites API**: Provides endpoints for adding and removing movies from a user's favorites list.
- **Secure Endpoints**: Certain routes require an Auth0 token to ensure secure access, adhering to best practices in API security.

## Database Structure
- **Technology**: PostgreSQL, managed through Prisma ORM, provides a robust foundation for data handling and relationships.
- **Core Tables**:
  - `Users`: Stores user profiles and related metadata.
  - `Movies`: Contains information on movies, including external API references.
  - `Reviews`: Records user-generated reviews, with relations to `Users` and `Movies`.

## User Experience
### Homepage
- **Anonymous Users**: Can browse and view top-rated and recent movies, as well as search for specific titles.
- **Authenticated Users**: See personalized content and have the option to interact (e.g., adding reviews or favoriting movies).

### Movie Search and Detail Viewing
- **All Users**: Both logged-in and non-logged-in users can search for movies using a search bar and view movie details, such as trailers, synopses, and ratings.
- **User Interactivity**: While non-authenticated users can view details, only authenticated users can add, edit, or delete reviews and manage favorites.

### Login/Register
- **Auth0 Integration**: Streamlined user authentication, allowing secure login and registration with minimal friction.
- **On-Demand Login**: Login is only required when identity verification is necessary, such as writing a review or managing favorites.

### Profile Management
- Users can view and modify their profile information and access their review and favorites history, enhancing the personalized user experience.

### Movie Details
- Displays all relevant movie information, reviews, and user interactions. Authenticated users can contribute by adding or modifying reviews and managing their favorites.

## Security
- **Auth0 Integration**: Ensures user data is protected and routes are secure.
- **Token-Based Authentication**: API routes leverage tokens to confirm user identity and permissions.
- **Secure User Data Handling**: Sensitive user actions, such as review management and favorites, are protected through validated routes.

## Responsiveness and Accessibility
- The platform is designed for optimal usability across devices, ensuring that both mobile and desktop users enjoy a seamless experience.
- **Accessibility Reports**: Includes Lighthouse accessibility reports for key pages, maintaining a score of at least 80 to meet industry standards.

## Testing and Quality Assurance
- **Unit Tests**: The front-end includes comprehensive unit tests using React Testing Library to ensure reliability and stability.
- **Automated CI/CD Pipelines**: Ensures consistent deployment and testing through established CI/CD practices.

## Deployment
- **Client**: Deployed on Vercel for high performance and reliability.
- **API Server**: Hosted to provide seamless integration with the client.
- **Database**: PostgreSQL database deployed and managed for secure data storage and retrieval.

## Accessibility Compliance
Lighthouse accessibility reports for three main pages are provided to demonstrate adherence to accessibility standards.
