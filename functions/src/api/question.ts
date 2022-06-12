import * as admin from 'firebase-admin'
import { Request, Response } from 'express'

const createQuestion = async (request: Request, response: Response) => {
  const uuid = admin.firestore().collection("question").doc().id
  admin.firestore().collection("question").doc(uuid).set({
    createAt: new Date(),
    body: request.body.body,
    userId: response.locals.uid,
    uuid: uuid,
    tags: (request.body.tags ?? [])
  })
  response.sendStatus(200)
}

const getAllQuestion = async (request: Request, response: Response) => {
  const queryMe = request.query.me
  const solved = request.query.solved
  const tags = request.query.tags
  var baseQuery = admin.firestore().collection('question')
  if (queryMe) {
    baseQuery = baseQuery.where('userId', '==', response.locals.uid) as any
  }
  if (solved) {
    baseQuery = baseQuery.where('solved', '==', true) as any
  }
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : Array(tags)
    baseQuery = baseQuery.where('tags', 'array-contains-any', tagsArray) as any
  }
  const snapshot = await baseQuery.orderBy('createAt', 'desc').get()
  const data = snapshot.docs.map(doc => doc.data())
  response.json(data)
}

const getOneQuestion = async (request: Request, response: Response) => {
  const snapshot = await admin.firestore().collection('question').doc(request.params.id).get()
  const data = snapshot.data()
  response.json(data)
}

const deleteQuestion = async (request: Request, response: Response) => {
  await admin.firestore().collection("question").doc(request.params.id).delete()
  response.sendStatus(200)
}

export { createQuestion, getAllQuestion, getOneQuestion, deleteQuestion }
