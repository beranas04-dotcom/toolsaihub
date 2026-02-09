import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { Tool, Review, Submission, NewsletterSubscriber } from '@/types';

// Tools
export async function getTools(status: 'published' | 'all' = 'published'): Promise<Tool[]> {
    const toolsRef = collection(db, 'tools');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (status === 'published') {
        constraints.unshift(where('status', '==', 'published'));
    }

    const q = query(toolsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Tool[];
}

export async function getTool(slug: string): Promise<Tool | null> {
    const toolsRef = collection(db, 'tools');
    const q = query(toolsRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
        id: doc.id,
        ...doc.data(),
    } as Tool;
}

export async function getToolById(id: string): Promise<Tool | null> {
    const docRef = doc(db, 'tools', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as Tool;
}

export async function createTool(tool: Omit<Tool, 'id'>): Promise<string> {
    const toolsRef = collection(db, 'tools');
    const docRef = await addDoc(toolsRef, {
        ...tool,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
    });
    return docRef.id;
}

export async function updateTool(id: string, updates: Partial<Tool>): Promise<void> {
    const docRef = doc(db, 'tools', id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now().toDate().toISOString(),
    });
}

export async function deleteTool(id: string): Promise<void> {
    const docRef = doc(db, 'tools', id);
    await deleteDoc(docRef);
}

// Reviews
export async function getReviews(toolId: string, status: 'approved' | 'all' = 'approved'): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const constraints: QueryConstraint[] = [
        where('toolId', '==', toolId),
        orderBy('createdAt', 'desc')
    ];

    if (status === 'approved') {
        constraints.splice(1, 0, where('status', '==', 'approved'));
    }

    const q = query(reviewsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Review[];
}

export async function getAllReviews(status: 'approved' | 'pending' | 'all' = 'all'): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (status !== 'all') {
        constraints.unshift(where('status', '==', status));
    }

    const q = query(reviewsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Review[];
}

export async function createReview(review: Omit<Review, 'id'>): Promise<string> {
    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, {
        ...review,
        createdAt: Timestamp.now().toDate().toISOString(),
        helpful: 0,
        status: 'pending',
    });
    return docRef.id;
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<void> {
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, updates);
}

export async function deleteReview(id: string): Promise<void> {
    const docRef = doc(db, 'reviews', id);
    await deleteDoc(docRef);
}

// Submissions
export async function getSubmissions(status?: 'pending' | 'approved' | 'rejected'): Promise<Submission[]> {
    const submissionsRef = collection(db, 'submissions');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (status) {
        constraints.unshift(where('status', '==', status));
    }

    const q = query(submissionsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Submission[];
}

export async function createSubmission(submission: Omit<Submission, 'id'>): Promise<string> {
    const submissionsRef = collection(db, 'submissions');
    const docRef = await addDoc(submissionsRef, {
        ...submission,
        createdAt: Timestamp.now().toDate().toISOString(),
        status: 'pending',
    });
    return docRef.id;
}

export async function updateSubmission(id: string, updates: Partial<Submission>): Promise<void> {
    const docRef = doc(db, 'submissions', id);
    await updateDoc(docRef, updates);
}

export async function deleteSubmission(id: string): Promise<void> {
    const docRef = doc(db, 'submissions', id);
    await deleteDoc(docRef);
}

// Newsletter
export async function subscribeToNewsletter(email: string): Promise<string> {
    const newsletterRef = collection(db, 'newsletter_emails');

    // Check if already subscribed
    const q = query(newsletterRef, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        throw new Error('Email already subscribed');
    }

    const docRef = await addDoc(newsletterRef, {
        email,
        subscribedAt: Timestamp.now().toDate().toISOString(),
        active: true,
    });

    return docRef.id;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    const newsletterRef = collection(db, 'newsletter_emails');
    const q = query(newsletterRef, where('active', '==', true), orderBy('subscribedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as NewsletterSubscriber[];
}
