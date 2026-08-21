import { collection, doc, getDocs, setDoc, query, getDoc, increment } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { Player, UserCareerState, GlobalStats } from "../types";
import { PLAYERS } from "../data/players";

const PLAYERS_COLLECTION = "players";
const CAREERS_COLLECTION = "careers";
const STATS_COLLECTION = "stats";

/**
 * Seeds static PLAYERS list into Firestore if Firestore is empty.
 * Then fetches and returns the full combined player array.
 */
export async function loadAndSeedPlayers(): Promise<Player[]> {
  try {
    const playersRef = collection(db, PLAYERS_COLLECTION);
    const snapshot = await getDocs(playersRef);
    
    const dbPlayersMap = new Map<string, Player>();
    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const p = doc.data() as Player;
        dbPlayersMap.set(p.id, p);
      });
    }

    // Combine static PLAYERS with DB players, DB players take priority
    const combinedMap = new Map<string, Player>();
    PLAYERS.forEach((p) => combinedMap.set(p.id, p));
    dbPlayersMap.forEach((p, id) => combinedMap.set(id, p));

    // Seeding phase: If collection is empty and user is authenticated, background seed
    if (snapshot.empty && auth.currentUser) {
      console.log("Firestore players catalog is empty. Initializing seed data in background...");
      const seedPromises = PLAYERS.map(async (player) => {
        const playerDocRef = doc(db, PLAYERS_COLLECTION, player.id);
        await setDoc(playerDocRef, player);
      });
      Promise.all(seedPromises)
        .then(() => console.log(`Successfully seeded ${PLAYERS.length} players into Firestore.`))
        .catch((err) => console.error("Background seeding failed", err));
    }

    return Array.from(combinedMap.values());
  } catch (error) {
    console.error("Error loading/seeding players from Firestore", error);
    // Graceful fallback to static data so the app NEVER crashes
    return PLAYERS;
  }
}

/**
 * Saves a player to the Firestore database.
 * Used for dynamic additions/updates.
 */
export async function savePlayerToDb(player: Player): Promise<void> {
  const path = `${PLAYERS_COLLECTION}/${player.id}`;
  try {
    const docRef = doc(db, PLAYERS_COLLECTION, player.id);
    await setDoc(docRef, player);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves a user's Career state to Firestore under their authenticated UID.
 */
export async function saveUserCareer(userId: string, career: UserCareerState): Promise<void> {
  const path = `${CAREERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, CAREERS_COLLECTION, userId);
    // Explicitly add userId to match Career schema in firebase-blueprint
    const payload = {
      userId,
      squadName: career.squadName || "Elite FC",
      seasonsCount: career.seasonsCount || 0,
      trophies: career.trophies || [],
      historicalSeasons: career.historicalSeasons || [],
      difficulty: career.difficulty || "Amateur",
      currentEraBalance: career.currentEraBalance || "balanced",
      currentActiveEras: career.currentActiveEras || [],
      customBadge: career.customBadge || null,
      coins: typeof career.coins === "number" ? career.coins : 1500,
      unlockedPlayerIds: career.unlockedPlayerIds || [],
    };
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches a user's Career state from Firestore.
 */
export async function fetchUserCareer(userId: string): Promise<UserCareerState | null> {
  const path = `${CAREERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, CAREERS_COLLECTION, userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserCareerState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Loads the global game statistics. Creates them if they do not exist.
 */
export async function fetchGlobalStats(): Promise<GlobalStats> {
  try {
    const docRef = doc(db, STATS_COLLECTION, "global");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as GlobalStats;
    } else {
      const initialStats: GlobalStats = { totalPlayers: 0, totalSeasonsCompleted: 0 };
      await setDoc(docRef, initialStats);
      return initialStats;
    }
  } catch (error) {
    console.error("Failed to fetch global stats, falling back", error);
    return { totalPlayers: 0, totalSeasonsCompleted: 0 };
  }
}

/**
 * Atomic increment of total global players count.
 */
export async function incrementGlobalPlayersCount(): Promise<void> {
  try {
    const docRef = doc(db, STATS_COLLECTION, "global");
    await setDoc(docRef, { totalPlayers: increment(1) }, { merge: true });
  } catch (error) {
    console.error("Failed to increment global player count", error);
  }
}

/**
 * Atomic increment of total seasons completed count.
 */
export async function incrementGlobalSeasonsCount(): Promise<void> {
  try {
    const docRef = doc(db, STATS_COLLECTION, "global");
    await setDoc(docRef, { totalSeasonsCompleted: increment(1) }, { merge: true });
  } catch (error) {
    console.error("Failed to increment global seasons count", error);
  }
}

