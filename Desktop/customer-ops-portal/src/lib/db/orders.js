import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'

export async function getOrder(orderId) {
  const snap = await getDoc(doc(db, 'orders', orderId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function listOrders(customerId = null) {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  if (customerId) {
    q = query(collection(db, 'orders'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createOrder(data) {
  const ref = await addDoc(collection(db, 'orders'), {
    ...data,
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await addOrderUpdate(ref.id, { type: 'created', message: 'Order created', createdByUid: data.createdByUid })
  return ref.id
}

export async function updateOrder(orderId, patch) {
  await updateDoc(doc(db, 'orders', orderId), { ...patch, updatedAt: serverTimestamp() })
}

// Timeline updates
export async function listOrderUpdates(orderId) {
  const q = query(collection(db, 'orders', orderId, 'updates'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addOrderUpdate(orderId, { type, message, createdByUid, createdByName }) {
  await addDoc(collection(db, 'orders', orderId, 'updates'), {
    type, message, createdByUid, createdByName: createdByName || null,
    createdAt: serverTimestamp(),
  })
}
