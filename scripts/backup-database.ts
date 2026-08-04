import { exec } from 'child_process'
import { promisify } from 'util'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { gzipSync } from 'zlib'

const execAsync = promisify(exec)

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env.local') })

const DATABASE_URL = process.env.DATABASE_URL
const BACKUP_DIR = join(__dirname, '../backups')

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not configured')
  process.exit(1)
}

// Ensure backup directory exists
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

interface BackupConfig {
  keepDaily: number
  keepWeekly: number
  keepMonthly: number
}

const backupConfig: BackupConfig = {
  keepDaily: 7,      // Keep last 7 daily backups
  keepWeekly: 4,     // Keep last 4 weekly backups
  keepMonthly: 12,   // Keep last 12 monthly backups
}

async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `stride-backup-${timestamp}.sql`
  const filepath = join(BACKUP_DIR, filename)
  const gzippedPath = `${filepath}.gz`

  console.log(`📦 Creating backup: ${filename}`)

  try {
    // Extract database info from DATABASE_URL
    const dbUrl = new URL(DATABASE_URL as string)
    const host = dbUrl.hostname
    const port = dbUrl.port || '5432'
    const database = dbUrl.pathname.slice(1)
    const username = dbUrl.username

    // Run pg_dump
    const password = dbUrl.password
    const command = `PGPASSWORD='${password}' pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-owner --no-privileges --format=plain > ${filepath}`
    
    await execAsync(command)

    // Compress the backup
    const fileContent = readFileSync(filepath)
    const compressed = gzipSync(fileContent)
    writeFileSync(gzippedPath, compressed)

    // Delete uncompressed file
    await execAsync(`rm ${filepath}`)

    console.log(`✅ Backup created: ${gzippedPath}`)
    return gzippedPath
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}

async function cleanOldBackups(): Promise<void> {
  console.log('🧹 Cleaning old backups...')

  const { stdout } = await execAsync(`ls -lt ${BACKUP_DIR} | tail -n +1 | awk '{print $NF}'`)
  const files = stdout.trim().split('\n').filter(Boolean)

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const weekMs = 7 * dayMs
  const monthMs = 30 * dayMs

  for (const file of files) {
    const filepath = join(BACKUP_DIR, file)
    const stats = await execAsync(`stat -c %Y ${filepath}`)
    const fileTime = parseInt(stats.stdout.trim()) * 1000
    const ageDays = (now - fileTime) / dayMs

    let shouldDelete = false

    if (ageDays > backupConfig.keepMonthly * 30) {
      shouldDelete = true
    } else if (ageDays > backupConfig.keepWeekly * 7 && ageDays <= backupConfig.keepMonthly * 30) {
      // Weekly backups older than keepWeekly weeks
      shouldDelete = true
    } else if (ageDays > backupConfig.keepDaily && ageDays <= backupConfig.keepWeekly * 7) {
      // Daily backups older than keepDaily days
      shouldDelete = true
    }

    if (shouldDelete) {
      await execAsync(`rm ${filepath}`)
      console.log(`🗑️  Deleted old backup: ${file}`)
    }
  }
}

async function uploadToCloudStorage(backupPath: string): Promise<void> {
  // Placeholder for cloud storage upload (e.g., AWS S3, Backblaze B2, R2)
  // This would be implemented based on your storage provider
  console.log(`☁️  Cloud storage upload: ${backupPath}`)
  console.log('⚠️  Configure cloud storage upload if needed')
}

async function main() {
  console.log('🔄 Starting database backup...')
  console.log(`📅 Timestamp: ${new Date().toISOString()}`)

  try {
    // Create backup
    const backupPath = await createBackup()

    // Clean old backups
    await cleanOldBackups()

    // Upload to cloud storage (optional)
    await uploadToCloudStorage(backupPath)

    console.log('✅ Backup completed successfully')
  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

// Run backup if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { createBackup, cleanOldBackups, uploadToCloudStorage }
