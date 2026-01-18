import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function listProducts(onlyActive = false) {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('name', 'asc')))
  let products = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  if (onlyActive) products = products.filter(p => p.active !== false)
  return products
}

export async function createProduct(data) {
  const ref = await addDoc(collection(db, 'products'), {
    ...data, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id, patch) {
  await updateDoc(doc(db, 'products', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id))
}
