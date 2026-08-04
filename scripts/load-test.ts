import { exec } from 'child_process'
import { promisify } from 'util'
import { config as dotenvConfig } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenvConfig({ path: join(__dirname, '../.env.local') })

const BASE_URL = process.env.LOAD_TEST_URL || 'http://localhost:3000'

interface LoadTestConfig {
  concurrentUsers: number
  totalRequests: number
  rampUpTime: number // seconds
  testDuration: number // seconds
}

const config: LoadTestConfig = {
  concurrentUsers: 100,
  totalRequests: 10000,
  rampUpTime: 10,
  testDuration: 60,
}

interface TestResult {
  url: string
  status: number
  time: number
  success: boolean
}

interface LoadTestSummary {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  requestsPerSecond: number
  errorsByStatus: Record<number, number>
}

async function makeRequest(url: string): Promise<TestResult> {
  const start = Date.now()
  
  try {
    const { stdout, stderr } = await execAsync(`curl -s -o /dev/null -w "%{http_code}\\n%{time_total}" "${url}"`)
    
    const [status, time] = stdout.trim().split('\n')
    const statusCode = parseInt(status)
    const responseTime = parseFloat(time) * 1000 // Convert to ms
    
    return {
      url,
      status: statusCode,
      time: responseTime,
      success: statusCode >= 200 && statusCode < 400,
    }
  } catch (error) {
    return {
      url,
      status: 0,
      time: Date.now() - start,
      success: false,
    }
  }
}

async function runLoadTest(urls: string[]): Promise<LoadTestSummary> {
  console.log('🚀 Starting load test...')
  console.log(`📊 Configuration:`)
  console.log(`   - Concurrent users: ${config.concurrentUsers}`)
  console.log(`   - Total requests: ${config.totalRequests}`)
  console.log(`   - Test duration: ${config.testDuration}s`)
  console.log(`   - Ramp-up time: ${config.rampUpTime}s`)
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`📅 Timestamp: ${new Date().toISOString()}`)
  console.log()

  const results: TestResult[] = []
  const startTime = Date.now()
  let completedRequests = 0

  // Ramp up users gradually
  for (let i = 0; i < config.concurrentUsers; i++) {
    setTimeout(async () => {
      for (let j = 0; j < Math.ceil(config.totalRequests / config.concurrentUsers); j++) {
        if (completedRequests >= config.totalRequests) break
        
        const url = urls[Math.floor(Math.random() * urls.length)]
        const result = await makeRequest(url)
        results.push(result)
        completedRequests++
        
        if (completedRequests % 100 === 0) {
          console.log(`📈 Progress: ${completedRequests}/${config.totalRequests} requests`)
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }, (i * (config.rampUpTime * 1000) / config.concurrentUsers))
  }

  // Wait for all requests to complete
  await new Promise(resolve => setTimeout(resolve, config.testDuration * 1000 + config.rampUpTime * 1000 + 5000))

  // Calculate statistics
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const responseTimes = results.map(r => r.time)
  
  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const minResponseTime = Math.min(...responseTimes)
  const maxResponseTime = Math.max(...responseTimes)
  
  const totalTime = (Date.now() - startTime) / 1000
  const requestsPerSecond = results.length / totalTime
  
  const errorsByStatus: Record<number, number> = {}
  for (const result of results) {
    if (!result.success) {
      errorsByStatus[result.status] = (errorsByStatus[result.status] || 0) + 1
    }
  }

  const summary: LoadTestSummary = {
    totalRequests: results.length,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    averageResponseTime,
    minResponseTime,
    maxResponseTime,
    requestsPerSecond,
    errorsByStatus,
  }

  return summary
}

async function testKeyEndpoints(): Promise<void> {
  console.log('🔍 Testing key endpoints...')
  
  const endpoints = [
    '/',
    '/products',
    '/api/health',
    '/api/auth/signin',
  ]

  for (const endpoint of endpoints) {
    const result = await makeRequest(`${BASE_URL}${endpoint}`)
    console.log(`   ${endpoint}: ${result.success ? '✅' : '❌'} (${result.status} - ${result.time.toFixed(0)}ms)`)
  }
  console.log()
}

async function getTestUrls(): Promise<string[]> {
  // First, get some product URLs to test
  try {
    const { stdout } = await execAsync(`curl -s "${BASE_URL}/api/health"`)
    console.log('Health check:', stdout.trim() || 'Failed')
  } catch (error) {
    console.error('Health check failed:', error)
  }

  // Generate test URLs
  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/products`,
    `${BASE_URL}/categories`,
    `${BASE_URL}/brands`,
    `${BASE_URL}/search?q=shoes`,
  ]

  return urls
}

async function printSummary(summary: LoadTestSummary): Promise<void> {
  console.log()
  console.log('📊 Load Test Results')
  console.log('==================')
  console.log(`Total Requests: ${summary.totalRequests}`)
  console.log(`Successful: ${summary.successfulRequests} (${((summary.successfulRequests / summary.totalRequests) * 100).toFixed(2)}%)`)
  console.log(`Failed: ${summary.failedRequests} (${((summary.failedRequests / summary.totalRequests) * 100).toFixed(2)}%)`)
  console.log()
  console.log(`Performance:`)
  console.log(`   Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms`)
  console.log(`   Min Response Time: ${summary.minResponseTime.toFixed(2)}ms`)
  console.log(`   Max Response Time: ${summary.maxResponseTime.toFixed(2)}ms`)
  console.log(`   Requests/sec: ${summary.requestsPerSecond.toFixed(2)}`)
  console.log()
  
  if (Object.keys(summary.errorsByStatus).length > 0) {
    console.log('Errors by Status Code:')
    for (const [status, count] of Object.entries(summary.errorsByStatus)) {
      console.log(`   ${status}: ${count} errors`)
    }
    console.log()
  }

  // Performance assessment
  console.log('🎯 Performance Assessment:')
  if (summary.averageResponseTime < 200) {
    console.log('   ✅ Excellent: Average response time under 200ms')
  } else if (summary.averageResponseTime < 500) {
    console.log('   ✅ Good: Average response time under 500ms')
  } else if (summary.averageResponseTime < 1000) {
    console.log('   ⚠️  Fair: Average response time under 1s')
  } else {
    console.log('   ❌ Poor: Average response time over 1s')
  }

  if (summary.successfulRequests / summary.totalRequests > 0.95) {
    console.log('   ✅ Excellent: Success rate over 95%')
  } else if (summary.successfulRequests / summary.totalRequests > 0.90) {
    console.log('   ✅ Good: Success rate over 90%')
  } else if (summary.successfulRequests / summary.totalRequests > 0.80) {
    console.log('   ⚠️  Fair: Success rate over 80%')
  } else {
    console.log('   ❌ Poor: Success rate under 80%')
  }

  if (summary.requestsPerSecond > 50) {
    console.log('   ✅ Excellent: Can handle 50+ req/sec')
  } else if (summary.requestsPerSecond > 20) {
    console.log('   ✅ Good: Can handle 20+ req/sec')
  } else if (summary.requestsPerSecond > 10) {
    console.log('   ⚠️  Fair: Can handle 10+ req/sec')
  } else {
    console.log('   ❌ Poor: Under 10 req/sec')
  }
  console.log()

  // Recommendations
  console.log('💡 Recommendations:')
  if (summary.averageResponseTime > 500) {
    console.log('   - Consider adding Redis caching')
    console.log('   - Optimize database queries')
    console.log('   - Add database indexes')
  }
  if (summary.successfulRequests / summary.totalRequests < 0.90) {
    console.log('   - Check server logs for errors')
    console.log('   - Increase server resources')
    console.log('   - Add rate limiting')
  }
  if (summary.requestsPerSecond < 20) {
    console.log('   - Scale horizontally with load balancer')
    console.log('   - Use serverless architecture')
    console.log('   - Optimize static asset delivery')
  }
}

async function main() {
  console.log('🧪 STRIDE Load Testing Tool')
  console.log('==========================')
  console.log()

  // Test endpoints first
  await testKeyEndpoints()

  // Get test URLs
  const urls = await getTestUrls()

  // Run load test
  const summary = await runLoadTest(urls)

  // Print summary
  await printSummary(summary)
}

// Run load test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { runLoadTest, testKeyEndpoints, getTestUrls }