import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const TASKS_DIR = process.env.TASKS_DIR || '/home/node/.openclaw/workspace'
const TASKS_FILE = path.join(TASKS_DIR, 'tasks.json')

async function readTasks() {
  try {
    if (!existsSync(TASKS_FILE)) return null
    const data = await readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function writeTasks(tasks: unknown) {
  await mkdir(path.dirname(TASKS_FILE), { recursive: true })
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

// GET - read tasks
export async function GET() {
  const tasks = await readTasks()
  return NextResponse.json({ ok: true, tasks })
}

// PUT - write full tasks array
export async function PUT(req: NextRequest) {
  try {
    const { tasks } = await req.json()
    if (!Array.isArray(tasks)) {
      return NextResponse.json({ ok: false, error: 'tasks must be an array' }, { status: 400 })
    }
    await writeTasks(tasks)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
