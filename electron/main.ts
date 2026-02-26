import { app, BrowserWindow, ipcMain, Notification, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { initDatabase } from './database/init'
import { TaskRepository } from './database/repositories/TaskRepository'
import { ProjectRepository } from './database/repositories/ProjectRepository'
import { NoteRepository } from './database/repositories/NoteRepository.ts'
import { FocusSessionRepository } from './database/repositories/FocusSessionRepository.ts'
import { HabitRepository } from './database/repositories/HabitRepository.ts'
import { AutomationRepository } from './database/repositories/AutomationRepository.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let db: Database.Database

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {

  Menu.setApplicationMenu(null)
  
  const iconPath = path.join(__dirname, '../assets/icon.png')
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#05060A',
    titleBarStyle: 'hiddenInset',
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.mjs')
    }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// Initialize database
function initDB() {
  const dbPath = path.join(app.getPath('userData'), 'neonflow.db')
  db = new Database(dbPath)
  initDatabase(db)
  console.log('Database initialized at:', dbPath)
}

// Repositories
let taskRepo: TaskRepository
let projectRepo: ProjectRepository
let noteRepo: NoteRepository
let focusRepo: FocusSessionRepository
let habitRepo: HabitRepository
let automationRepo: AutomationRepository

function initRepositories() {
  taskRepo = new TaskRepository(db)
  projectRepo = new ProjectRepository(db)
  noteRepo = new NoteRepository(db)
  focusRepo = new FocusSessionRepository(db)
  habitRepo = new HabitRepository(db)
  automationRepo = new AutomationRepository(db)
}

// IPC Handlers - Tasks
ipcMain.handle('tasks:create', async (_, task) => {
  try {
    return { success: true, data: taskRepo.create(task) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('tasks:list', async (_, filter) => {
  try {
    return { success: true, data: taskRepo.list(filter) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('tasks:get', async (_, id) => {
  try {
    return { success: true, data: taskRepo.getById(id) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('tasks:update', async (_, id, updates) => {
  try {
    taskRepo.update(id, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('tasks:delete', async (_, id) => {
  try {
    taskRepo.delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('tasks:search', async (_, query) => {
  try {
    return { success: true, data: taskRepo.search(query) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Projects
ipcMain.handle('projects:create', async (_, project) => {
  try {
    return { success: true, data: projectRepo.create(project) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('projects:list', async () => {
  try {
    return { success: true, data: projectRepo.list() }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('projects:update', async (_, id, updates) => {
  try {
    projectRepo.update(id, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('projects:delete', async (_, id) => {
  try {
    projectRepo.delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Notes
ipcMain.handle('notes:create', async (_, note) => {
  try {
    return { success: true, data: noteRepo.create(note) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('notes:list', async () => {
  try {
    return { success: true, data: noteRepo.list() }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('notes:get', async (_, id) => {
  try {
    return { success: true, data: noteRepo.getById(id) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('notes:update', async (_, id, updates) => {
  try {
    noteRepo.update(id, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('notes:delete', async (_, id) => {
  try {
    noteRepo.delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('notes:getBacklinks', async (_, noteId) => {
  try {
    return { success: true, data: noteRepo.getBacklinks(noteId) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Focus Sessions
ipcMain.handle('focus:create', async (_, session) => {
  try {
    return { success: true, data: focusRepo.create(session) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('focus:list', async (_, filter) => {
  try {
    return { success: true, data: focusRepo.list(filter) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('focus:stats', async (_, startDate, endDate) => {
  try {
    return { success: true, data: focusRepo.getStats(startDate, endDate) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Habits
ipcMain.handle('habits:create', async (_, habit) => {
  try {
    return { success: true, data: habitRepo.create(habit) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('habits:list', async () => {
  try {
    return { success: true, data: habitRepo.list() }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('habits:update', async (_, id, updates) => {
  try {
    habitRepo.update(id, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('habits:delete', async (_, id) => {
  try {
    habitRepo.delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('habits:log', async (_, habitId, date) => {
  try {
    habitRepo.logCompletion(habitId, date)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('habits:logs', async (_, habitId, startDate, endDate) => {
  try {
    return { success: true, data: habitRepo.getLogs(habitId, startDate, endDate) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Automations
ipcMain.handle('automations:create', async (_, automation) => {
  try {
    return { success: true, data: automationRepo.create(automation) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('automations:list', async () => {
  try {
    return { success: true, data: automationRepo.list() }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('automations:update', async (_, id, updates) => {
  try {
    automationRepo.update(id, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('automations:delete', async (_, id) => {
  try {
    automationRepo.delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Notification handler
ipcMain.handle('notification:show', async (_, { title, body }) => {
  try {
    new Notification({ title, body }).show()
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// App lifecycle
app.whenReady().then(() => {
  initDB()
  initRepositories()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close()
    app.quit()
  }
})

app.on('will-quit', () => {
  db.close()
})
