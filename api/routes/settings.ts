import express, { type Request, type Response } from 'express'
import { getGlobalSettings, modifyGlobalSettings } from '../services/ruleService.js'
import type { GlobalSettings } from '../types/index.js'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  const settings = getGlobalSettings()
  res.json({ success: true, data: settings })
})

router.put('/', (req: Request, res: Response) => {
  try {
    const settings = modifyGlobalSettings(req.body as Partial<GlobalSettings>)
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message })
  }
})

export default router
