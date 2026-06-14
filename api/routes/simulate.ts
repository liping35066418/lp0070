import express, { type Request, type Response } from 'express'
import {
  triggerPopup,
  startCycleTest,
  stopCycleTest,
  isCycleRunning,
  triggerByType,
} from '../services/simulateService.js'
import type { CycleTestConfig, TriggerType } from '../types/index.js'

const router = express.Router()

router.post('/trigger', (req: Request, res: Response) => {
  const { ruleId } = req.body as { ruleId: string }
  if (!ruleId) {
    res.status(400).json({ success: false, error: 'ruleId is required' })
    return
  }
  const rule = triggerPopup(ruleId)
  if (!rule) {
    res.status(404).json({ success: false, error: 'Rule not found' })
    return
  }
  res.json({ success: true, data: rule })
})

router.post('/trigger/type/:type', (req: Request, res: Response) => {
  const triggerType = req.params.type as TriggerType
  const validTypes: TriggerType[] = ['page_load', 'click', 'dwell', 'timer']
  if (!validTypes.includes(triggerType)) {
    res.status(400).json({ success: false, error: 'Invalid trigger type' })
    return
  }
  const result = triggerByType(triggerType)
  if (!result.success) {
    res.status(404).json({ success: false, error: result.message })
    return
  }
  res.json({ success: true, data: result })
})

router.post('/cycle', (req: Request, res: Response) => {
  const config = req.body as Partial<CycleTestConfig>
  if (!config.ruleIds || !Array.isArray(config.ruleIds)) {
    res.status(400).json({ success: false, error: 'ruleIds must be an array' })
    return
  }
  if (!config.interval || config.interval < 0) {
    res.status(400).json({ success: false, error: 'interval must be a non-negative number' })
    return
  }
  if (!config.repeat || config.repeat < 1) {
    res.status(400).json({ success: false, error: 'repeat must be at least 1' })
    return
  }
  const result = startCycleTest(config as CycleTestConfig)
  if (!result.success) {
    res.status(400).json({ success: false, error: result.message })
    return
  }
  res.json({ success: true, data: { totalSteps: result.totalSteps } })
})

router.post('/cycle/stop', (req: Request, res: Response) => {
  const result = stopCycleTest()
  res.json({ success: true, data: { message: result.message } })
})

router.get('/cycle/status', (req: Request, res: Response) => {
  const running = isCycleRunning()
  res.json({ success: true, data: { running } })
})

export default router
