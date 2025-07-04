import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject(PROJECT_ID); // Your Appwrite Project ID

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // 1. use appwrite sdk to check if the search term exists in the database
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ]);
    // 2. if it does, increment the count
    if (result.documents.length > 0) {
      // If the search term exists, increment the count
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      // 3. if it doesn't, create a new document with the search term and count as 1
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error('Error checking search term:', error);
  }

  console.log('Appwrite Config:', {
    PROJECT_ID,
    DATABASE_ID,
    COLLECTION_ID,
  });
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc('count'),
    ]);
    return result.documents;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};
