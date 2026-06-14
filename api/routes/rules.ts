import express, { type Request, type Response } from 'express'
import {
  listRules,
  getRule,
  addRule,
  modifyRule,
  removeRule,
  switchRuleEnabled,
  sortRules,
} from '../services/ruleService.js'
import type { PopupRule } from '../types/index.js'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  const rules = listRules()
  res.json({ success: true, data: rules })
})

router.get('/:id', (req: Request, res: Response) => {
  const rule = getRule(req.params.id)
  if (!rule) {
    res.status(404).json({ success: false, error: 'Rule not found' })
    return
  }
  res.json({ success: true, data: rule })
})

router.post('/', (req: Request, res: Response) => {
  try {
    const ruleData = req.body as Omit<PopupRule, 'id' | 'createdAt' | 'updatedAt' | 'order'>
    const newRule = addRule(ruleData)
    res.status(201).json({ success: true, data: newRule })
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message })
  }
})

router.put('/:id', (req: Request, res: Response) => {
  const rule = modifyRule(req.params.id, req.body as Partial<PopupRule>)
  if (!rule) {
    res.status(404).json({ success: false, error: 'Rule not found' })
    return
  }
  res.json({ success: true, data: rule })
})

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = removeRule(req.params.id)
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Rule not found' })
    return
  }
  res.json({ success: true })
})

router.patch('/:id/toggle', (req: Request, res: Response) => {
  const rule = switchRuleEnabled(req.params.id)
  if (!rule) {
    res.status(404).json({ success: false, error: 'Rule not found' })
    return
  }
  res.json({ success: true, data: rule })
})

router.put('/reorder', (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] }
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, error: 'orderedIds must be an array' })
    return
  }
  const rules = sortRules(orderedIds)
  res.json({ success: true, data: rules })
})

export default router
