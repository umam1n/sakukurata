import {
  doc,
  collection,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { inferBucketKind } from '../utils/templates';

const userDoc = (uid) => doc(db, 'users', uid);
const userCol = (uid, name) => collection(db, 'users', uid, name);

export const subscribeUserProfile = (uid, callback) => {
  return onSnapshot(userDoc(uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
};

export const subscribeSubcollection = (uid, subName, callback, orderField = null, orderDir = 'desc') => {
  const ref = userCol(uid, subName);
  const q = orderField ? query(ref, orderBy(orderField, orderDir)) : ref;
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

export const saveOnboardingBatch = async (uid, { profile, buckets, wallets, quickActions }) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  batch.set(
    userDoc(uid),
    {
      ...profile,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now
    },
    { merge: true }
  );

  const createdBucketIds = [];
  buckets.forEach((b, idx) => {
    const ref = doc(userCol(uid, 'buckets'));
    createdBucketIds.push({ id: ref.id, name: b.name });
    batch.set(ref, {
      name: b.name,
      percentage: Number(b.percentage) || 0,
      color: b.color || '#10b981',
      icon: b.icon || 'Tag',
      kind: inferBucketKind(b),
      sortOrder: idx
    });
  });

  let firstWalletId = null;
  wallets.forEach((w) => {
    const ref = doc(userCol(uid, 'wallets'));
    if (!firstWalletId) firstWalletId = ref.id;
    batch.set(ref, {
      name: w.name,
      type: w.type || 'bank',
      balance: Number(w.balance) || 0,
      color: w.color || '#3b82f6'
    });
  });

  quickActions.forEach((qa) => {
    const ref = doc(userCol(uid, 'quickActions'));
    const defaultBucket = createdBucketIds[0] || { id: null, name: 'Umum' };
    batch.set(ref, {
      title: qa.title,
      amount: Number(qa.amount) || 0,
      bucketId: qa.bucketId || defaultBucket.id,
      bucketName: qa.bucketName || defaultBucket.name,
      walletId: qa.walletId || firstWalletId,
      color: qa.color || '#10b981',
      icon: qa.icon || 'Coffee'
    });
  });

  await batch.commit();
};

export const updateUserProfileDoc = async (uid, data) => {
  await setDoc(
    userDoc(uid),
    {
      ...data,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
};

export const replaceUserBuckets = async (uid, existingBucketIds, newBuckets) => {
  const batch = writeBatch(db);
  const nextIds = new Set(newBuckets.filter((b) => b.id && !String(b.id).startsWith('tmp_')).map((b) => b.id));

  existingBucketIds.forEach((oldId) => {
    if (!nextIds.has(oldId)) {
      batch.delete(doc(db, 'users', uid, 'buckets', oldId));
    }
  });

  newBuckets.forEach((b, idx) => {
    const isExisting = b.id && !String(b.id).startsWith('tmp_');
    const ref = isExisting ? doc(db, 'users', uid, 'buckets', b.id) : doc(userCol(uid, 'buckets'));
    batch.set(ref, {
      name: b.name,
      percentage: Number(b.percentage) || 0,
      color: b.color || '#10b981',
      icon: b.icon || 'Tag',
      kind: inferBucketKind(b),
      sortOrder: idx
    });
  });

  await batch.commit();
};

export const addSubDoc = async (uid, subName, data) => {
  const ref = await addDoc(userCol(uid, subName), data);
  return ref.id;
};

export const updateSubDoc = async (uid, subName, docId, data) => {
  await updateDoc(doc(db, 'users', uid, subName, docId), data);
};

export const deleteSubDoc = async (uid, subName, docId) => {
  await deleteDoc(doc(db, 'users', uid, subName, docId));
};
