
// @ts-ignore
import { getUser } from "../utils/database/supabase"

export function loggerMiddleware(req: any, _res: any, next: Function) {
  const now = new Date().toISOString()
  console.log(`[${now}] ${req.method} ${req.url}`)
  next()
}

export async function authMiddleware(req: any, res: any, next: Function) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]
  try {
    const user = await getUser(token)
    req.user = user
  } catch (error) {
    console.error("Auth error", error)
    req.user = null
  }
  next()
}