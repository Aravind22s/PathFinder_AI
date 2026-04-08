import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, CareerRecommendation, LearningRoadmap, MockInterview } from '../types';

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data() as UserProfile;
    return {
      ...data,
      skills: data.skills || [],
      knowledge: data.knowledge || [],
      pastRoles: data.pastRoles || [],
      achievements: data.achievements || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
      interests: data.interests || [],
      savedRoadmaps: data.savedRoadmaps || [],
      savedSteps: data.savedSteps || []
    };
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    await setDoc(doc(db, 'users', profile.uid), profile);
  },

  async getRecommendations(userId: string): Promise<CareerRecommendation[]> {
    const q = query(
      collection(db, 'recommendations'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CareerRecommendation));
  },

  async saveRecommendation(rec: CareerRecommendation): Promise<void> {
    await addDoc(collection(db, 'recommendations'), rec);
  },

  async getRoadmap(userId: string, careerTitle: string): Promise<LearningRoadmap | null> {
    const q = query(
      collection(db, 'roadmaps'),
      where('userId', '==', userId),
      where('careerTitle', '==', careerTitle),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as LearningRoadmap;
  },

  async saveRoadmap(roadmap: LearningRoadmap): Promise<void> {
    await addDoc(collection(db, 'roadmaps'), roadmap);
  },

  async updateRoadmap(id: string, roadmap: Partial<LearningRoadmap>): Promise<void> {
    const docRef = doc(db, 'roadmaps', id);
    await updateDoc(docRef, roadmap);
  },

  async saveInterview(interview: MockInterview): Promise<void> {
    await addDoc(collection(db, 'interviews'), interview);
  },

  async toggleRoadmapBookmark(userId: string, roadmapId: string): Promise<void> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const data = docSnap.data() as UserProfile;
    const savedRoadmaps = data.savedRoadmaps || [];
    const isSaved = savedRoadmaps.includes(roadmapId);
    const newSaved = isSaved 
      ? savedRoadmaps.filter(id => id !== roadmapId)
      : [...savedRoadmaps, roadmapId];
    await updateDoc(docRef, { savedRoadmaps: newSaved });
  },

  async toggleStepBookmark(userId: string, roadmapId: string, stepIndex: number): Promise<void> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const data = docSnap.data() as UserProfile;
    const savedSteps = data.savedSteps || [];
    const isSaved = savedSteps.some(s => s.roadmapId === roadmapId && s.stepIndex === stepIndex);
    const newSaved = isSaved 
      ? savedSteps.filter(s => !(s.roadmapId === roadmapId && s.stepIndex === stepIndex))
      : [...savedSteps, { roadmapId, stepIndex }];
    await updateDoc(docRef, { savedSteps: newSaved });
  }
};
